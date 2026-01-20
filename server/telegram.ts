import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { computeCheck } from "telegram/Password";
import { storage } from "./storage";
import { type Account } from "@shared/schema";
import { randomInt } from "crypto";

// Telegram API credentials - Use env vars if set, otherwise fall back to Telegram Desktop public credentials
// WARNING: Using public credentials for bulk messaging increases ban risk
const DEFAULT_API_ID = parseInt(process.env.TELEGRAM_API_ID || "2040", 10);
const DEFAULT_API_HASH = process.env.TELEGRAM_API_HASH || "b18441a1ff607e10a989891a5462e627";

// Map to store active clients: accountId -> Client
const activeClients = new Map<number, TelegramClient>();
// Map to store last sent time: accountId -> timestamp (ms)
const lastSentTime = new Map<number, number>();
// Map to store flood wait end time: accountId -> timestamp when wait ends
const floodWaitUntil = new Map<number, number>();
// Map to store messages sent today per account
const dailyMessageCount = new Map<number, { count: number; resetAt: number }>();

// Safe limits to avoid bans
const SAFE_LIMITS = {
    minDelaySeconds: 30,       // Minimum 30 seconds between messages
    maxDelaySeconds: 90,       // Maximum 90 seconds
    messagesPerHour: 50,       // Max 50 messages per hour
    dailyMessageLimit: 200,    // Max 200 messages per day
    floodWaitBuffer: 10,       // Extra seconds after flood wait
};

// Helper to get random delay between min and max (seconds) -> ms
function getDelayMs(min: number, max: number) {
    const safeMin = Math.max(min, SAFE_LIMITS.minDelaySeconds);
    const safeMax = Math.max(max, SAFE_LIMITS.maxDelaySeconds);
    return randomInt(safeMin, safeMax + 1) * 1000;
}

// Get API credentials for account (use per-account if set, otherwise defaults)
function getApiCredentials(account?: Account) {
    if (account?.apiId && account?.apiHash) {
        return { apiId: account.apiId, apiHash: account.apiHash };
    }
    return { apiId: DEFAULT_API_ID, apiHash: DEFAULT_API_HASH };
}

// Check and update daily message count
function checkDailyLimit(accountId: number): boolean {
    const now = Date.now();
    const stats = dailyMessageCount.get(accountId);
    
    // Reset if new day
    if (!stats || now > stats.resetAt) {
        dailyMessageCount.set(accountId, { 
            count: 0, 
            resetAt: now + 24 * 60 * 60 * 1000 
        });
        return true;
    }
    
    return stats.count < SAFE_LIMITS.dailyMessageLimit;
}

function incrementDailyCount(accountId: number) {
    const stats = dailyMessageCount.get(accountId);
    if (stats) {
        stats.count++;
    }
}

export class TelegramService {
    // === AUTH METHODS ===
    
    private tempClients = new Map<string, { client: TelegramClient; apiId: number; apiHash: string }>();

    async requestCode(phoneNumber: string, apiId?: number, apiHash?: string) {
        // Use provided credentials or defaults
        const credentials = apiId && apiHash 
            ? { apiId, apiHash } 
            : { apiId: DEFAULT_API_ID, apiHash: DEFAULT_API_HASH };
        
        const client = new TelegramClient(new StringSession(""), credentials.apiId, credentials.apiHash, {
            connectionRetries: 5,
        });
        await client.connect();
        
        const { phoneCodeHash } = await client.sendCode(
            {
                apiId: credentials.apiId,
                apiHash: credentials.apiHash,
            },
            phoneNumber
        );
        
        this.tempClients.set(phoneNumber, { client, ...credentials });
        
        return phoneCodeHash;
    }

    async signIn(phoneNumber: string, phoneCode: string, phoneCodeHash: string, password?: string) {
        const temp = this.tempClients.get(phoneNumber);
        if (!temp) {
            throw new Error("Auth session expired or not found. Please request code again.");
        }
        
        const { client, apiId, apiHash } = temp;

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
                
                // For 2FA, we need to get password info and compute SRP check
                const passwordInfo = await client.invoke(new Api.account.GetPassword());
                const passwordCheck = await computeCheck(passwordInfo, password);
                await client.invoke(new Api.auth.CheckPassword({ password: passwordCheck }));
            } else {
                throw e;
            }
        }

        const sessionString = client.session.save() as unknown as string;
        this.tempClients.delete(phoneNumber);
        await client.disconnect();
        
        // Return session and credentials used (for storage)
        return { sessionString, apiId, apiHash };
    }

    // === WORKER MANAGEMENT ===

    async startAccount(account: Account) {
        if (activeClients.has(account.id)) return; // Already running

        if (!account.sessionString) {
            await storage.addLog(account.id, "error", "Missing session - please re-authenticate");
            return;
        }

        try {
            // Use per-account credentials if set, otherwise defaults
            const { apiId, apiHash } = getApiCredentials(account);
            
            const client = new TelegramClient(
                new StringSession(account.sessionString),
                apiId,
                apiHash,
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
    
    // === SAFE CONTACT IMPORT ===
    
    private async safeImportContact(client: TelegramClient, phoneNumber: string, accountId: number): Promise<any> {
        try {
            // Import single contact with delay
            const result = await client.invoke(
                new Api.contacts.ImportContacts({
                    contacts: [
                        new Api.InputPhoneContact({
                            clientId: BigInt(Math.floor(Math.random() * 1000000)) as any,
                            phone: phoneNumber,
                            firstName: "Contact",
                            lastName: phoneNumber.slice(-4),
                        }),
                    ],
                })
            );
            
            if (result.users && result.users.length > 0) {
                await storage.addLog(accountId, "info", `Imported contact: ${phoneNumber}`);
                return result.users[0];
            }
            
            return null;
        } catch (err: any) {
            if (err.message?.includes("FLOOD_WAIT")) {
                const waitSeconds = err.seconds || 60;
                floodWaitUntil.set(accountId, Date.now() + (waitSeconds + SAFE_LIMITS.floodWaitBuffer) * 1000);
                await storage.addLog(accountId, "warn", `Flood wait: ${waitSeconds}s`);
            }
            throw err;
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
            const entries = Array.from(activeClients.entries());
            for (const [accountId, client] of entries) {
                await this.processAccount(accountId, client);
            }
        }, 5000);
    }

    private async processAccount(accountId: number, client: TelegramClient) {
        try {
            const account = await storage.getAccount(accountId);
            if (!account || !account.isRunning) {
                this.stopAccount(accountId);
                return;
            }

            // Check if we're in flood wait
            const floodEnd = floodWaitUntil.get(accountId);
            if (floodEnd && Date.now() < floodEnd) {
                const remaining = Math.ceil((floodEnd - Date.now()) / 1000);
                await storage.updateAccount(accountId, { status: `waiting (flood: ${remaining}s)` });
                return;
            }

            // Check daily limit
            if (!checkDailyLimit(accountId)) {
                await storage.addLog(accountId, "warn", "Daily message limit reached. Pausing until tomorrow.");
                await storage.updateAccount(accountId, { status: "paused (daily limit)" });
                return;
            }

            // Check delays - enforce safe minimums
            const lastSent = lastSentTime.get(accountId) || 0;
            const now = Date.now();
            const minDelay = Math.max(account.minDelaySeconds || 60, SAFE_LIMITS.minDelaySeconds) * 1000;
            
            if (now - lastSent < minDelay) return; 

            // Get pending recipient
            const recipient = await storage.getNextPendingRecipient(accountId);
            if (!recipient) {
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
                let targetEntity: any = recipient.identifier;
                const isPhoneNumber = recipient.identifier.startsWith('+') || /^\d+$/.test(recipient.identifier);
                
                if (isPhoneNumber) {
                    const phoneNumber = recipient.identifier.startsWith('+') 
                        ? recipient.identifier 
                        : '+' + recipient.identifier;
                    
                    // First try to get entity if already in contacts
                    try {
                        targetEntity = await client.getEntity(phoneNumber);
                    } catch {
                        // Not in contacts - try safe import
                        await storage.addLog(accountId, "info", `Importing contact: ${phoneNumber}`);
                        
                        // Wait before import to be safe
                        await new Promise(r => setTimeout(r, 3000));
                        
                        const user = await this.safeImportContact(client, phoneNumber, accountId);
                        if (!user) {
                            throw new Error(`User not found on Telegram: ${phoneNumber}`);
                        }
                        targetEntity = user;
                        
                        // Extra delay after import
                        await new Promise(r => setTimeout(r, 5000));
                    }
                }
                
                await client.sendMessage(targetEntity, { message: messageText });
                
                await storage.updateRecipientStatus(recipient.id, 'sent');
                await storage.addLog(accountId, "info", `Sent to ${recipient.identifier}`);
                
                // Update counters
                lastSentTime.set(accountId, Date.now());
                incrementDailyCount(accountId);
                
                await storage.updateAccount(accountId, { status: "waiting" });
                
            } catch (err: any) {
                const errorMsg = err.message || String(err);
                await storage.updateRecipientStatus(recipient.id, 'failed', errorMsg);
                await storage.addLog(accountId, "error", `Failed: ${recipient.identifier} - ${errorMsg}`);
                
                // Handle FLOOD_WAIT - don't stop, just wait
                if (errorMsg.includes("FLOOD_WAIT") || err.errorMessage === "FLOOD_WAIT") {
                    const waitSeconds = err.seconds || 120;
                    floodWaitUntil.set(accountId, Date.now() + (waitSeconds + SAFE_LIMITS.floodWaitBuffer) * 1000);
                    await storage.addLog(accountId, "warn", `Flood wait triggered: ${waitSeconds}s`);
                    await storage.updateAccount(accountId, { status: `flood wait: ${waitSeconds}s` });
                    return;
                }
                
                // Critical errors - stop account
                if (errorMsg.includes("AUTH_KEY") || errorMsg.includes("SESSION_REVOKED") || errorMsg.includes("USER_DEACTIVATED")) {
                    await this.stopAccount(accountId);
                    await storage.updateAccount(accountId, { lastError: errorMsg, status: "error" });
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
