import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { storage } from "./storage";
import { type Account } from "@shared/schema";
import { randomInt } from "crypto";

// Map to store active clients: accountId -> Client
const activeClients = new Map<number, TelegramClient>();
// Map to store last sent time: accountId -> timestamp (ms)
const lastSentTime = new Map<number, number>();

// Helper to get random delay between min and max (seconds) -> ms
function getDelayMs(min: number, max: number) {
    return randomInt(min, max + 1) * 1000;
}

export class TelegramService {
    // === AUTH METHODS ===

    async requestCode(phoneNumber: string, apiId: number, apiHash: string) {
        const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
            connectionRetries: 5,
        });
        await client.connect();
        
        const { phoneCodeHash } = await client.sendCode(
            {
                apiId,
                apiHash,
            },
            phoneNumber
        );
        
        // We don't keep this client connected, just need the hash
        // In a real app, we might need to keep the client instance for the sign-in step to ensure same session ID context?
        // GramJS usually allows stateless sign-in if we have the hash.
        // But to be safe, we might need to cache this client temporarily.
        // For simplicity, we'll try to recreate client in signIn. 
        // If that fails, we'd need a temporary cache.
        // *Correction*: SendCode + SignIn usually requires the same client instance or session context.
        // We will store this temporary client in a cache.
        this.tempClients.set(phoneNumber, client);
        
        return phoneCodeHash;
    }
    
    private tempClients = new Map<string, TelegramClient>();

    async signIn(phoneNumber: string, phoneCode: string, phoneCodeHash: string, password?: string) {
        let client = this.tempClients.get(phoneNumber);
        if (!client) {
            throw new Error("Auth session expired or not found. Please request code again.");
        }

        try {
            await client.invoke(
                new Api.auth.SignIn({
                    phoneNumber,
                    phoneCodeHash,
                    phoneCode,
                })
            );
        } catch (e: any) {
            if (e.message.includes("SESSION_PASSWORD_NEEDED")) {
                if (!password) throw new Error("2FA Password required");
                await client.signInWithPassword({
                    apiId: undefined, // already set
                    apiHash: undefined,
                    password: password,
                    phoneNumber, 
                    phoneCodeHash, 
                    phoneCode 
                } as any); // Type cast due to varied signatures in gramjs versions
            } else {
                throw e;
            }
        }

        const sessionString = client.session.save() as unknown as string;
        this.tempClients.delete(phoneNumber);
        await client.disconnect();
        return sessionString;
    }

    // === WORKER MANAGEMENT ===

    async startAccount(account: Account) {
        if (activeClients.has(account.id)) return; // Already running

        if (!account.sessionString || !account.apiId || !account.apiHash) {
            await storage.addLog(account.id, "error", "Missing session or API credentials");
            return;
        }

        try {
            const client = new TelegramClient(
                new StringSession(account.sessionString),
                account.apiId,
                account.apiHash,
                { connectionRetries: 5 }
            );

            // Proxy setup would go here if account.proxyUrl is set
            // GramJS supports proxies in connection options.
            
            await client.connect();
            activeClients.set(account.id, client);
            lastSentTime.set(account.id, Date.now()); // Reset timer
            
            await storage.updateAccount(account.id, { isRunning: true, status: "running" });
            await storage.addLog(account.id, "info", "Account started");
        } catch (err: any) {
            await storage.updateAccount(account.id, { isRunning: false, status: "error", lastError: err.message });
            await storage.addLog(account.id, "error", `Failed to start: ${err.message}`);
        }
    }

    async stopAccount(accountId: number) {
        const client = activeClients.get(accountId);
        if (client) {
            await client.disconnect();
            activeClients.delete(accountId);
        }
        await storage.updateAccount(accountId, { isRunning: false, status: "idle" });
        await storage.addLog(accountId, "info", "Account stopped");
    }

    // === MAIN LOOP ===
    
    async runWorker() {
        // Run every 5 seconds
        setInterval(async () => {
            for (const [accountId, client] of activeClients) {
                await this.processAccount(accountId, client);
            }
        }, 5000);
    }

    private async processAccount(accountId: number, client: TelegramClient) {
        try {
            const account = await storage.getAccount(accountId);
            if (!account || !account.isRunning) {
                // Should have been stopped, but just in case
                this.stopAccount(accountId);
                return;
            }

            // Check delays
            const lastSent = lastSentTime.get(accountId) || 0;
            const now = Date.now();
            const minDelay = (account.minDelaySeconds || 60) * 1000;
            const maxDelay = (account.maxDelaySeconds || 180) * 1000;
            
            // If we haven't waited long enough (we don't store "next scheduled time", just check roughly)
            // Better: When we send, we determine the NEXT allowed time.
            // But here, let's just use a simple check: if (now - lastSent) > random(min, max)
            // To prevent "spamming" random calls, let's store `nextActionTime` instead.
            // For now, simpler: ensure at least minDelay has passed.
            if (now - lastSent < minDelay) return; 

            // Get pending recipient
            const recipient = await storage.getNextPendingRecipient(accountId);
            if (!recipient) {
                // No more recipients
                // Maybe pause account? Or just idle.
                if (account.status !== "idle") {
                    await storage.updateAccount(accountId, { status: "idle" });
                }
                return;
            }

            // Determine message text
            let messageText = account.messageTemplate;
            if (!messageText && account.groupId) {
                const group = await storage.getGroup(account.groupId);
                messageText = group?.messageTemplate || "";
            }

            if (!messageText) {
                 await storage.addLog(accountId, "warn", "No message template found, skipping");
                 return;
            }

            // Send Message
            await storage.updateAccount(accountId, { status: "sending" });
            
            try {
                await client.sendMessage(recipient.identifier, { message: messageText });
                
                await storage.updateRecipientStatus(recipient.id, 'sent');
                await storage.addLog(accountId, "info", `Sent message to ${recipient.identifier}`);
                
                // Update stats
                lastSentTime.set(accountId, Date.now());
                
                // Set status back to running/waiting
                await storage.updateAccount(accountId, { status: "waiting" });
                
            } catch (err: any) {
                await storage.updateRecipientStatus(recipient.id, 'failed', err.message);
                await storage.addLog(accountId, "error", `Failed to send to ${recipient.identifier}: ${err.message}`);
                
                // If it's a critical error (like flood wait or auth lost), stop account
                if (err.message.includes("FLOOD_WAIT") || err.message.includes("AUTH_KEY")) {
                    await this.stopAccount(accountId);
                    await storage.updateAccount(accountId, { lastError: err.message, status: "error" });
                }
            }

        } catch (err: any) {
            console.error(`Error processing account ${accountId}:`, err);
        }
    }

    // === INITIALIZATION ===
    async initialize() {
        const accounts = await storage.getAccounts();
        for (const account of accounts) {
            if (account.isRunning) {
                this.startAccount(account);
            }
        }
        this.runWorker();
    }
}

export const telegramService = new TelegramService();
