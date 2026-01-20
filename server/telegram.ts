import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { computeCheck } from "telegram/Password";
import { storage } from "./storage";
import { type Account } from "@shared/schema";
import { randomInt } from "crypto";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const KYIV_TIMEZONE = "Europe/Kyiv";

// Telegram API credentials - Use env vars if set, otherwise fall back to Telegram Desktop public credentials
// WARNING: Using public credentials for bulk messaging increases ban risk
const DEFAULT_API_ID = parseInt(process.env.TELEGRAM_API_ID || "2040", 10);
const DEFAULT_API_HASH = process.env.TELEGRAM_API_HASH || "b18441a1ff607e10a989891a5462e627";

// Proxy configuration from environment variable
// Format: socks5://user:pass@host:port or http://host:port
const PROXY_URL = process.env.PROXY_URL || "";

// Parse proxy URL into GramJS format
function getProxyConfig(): any {
    if (!PROXY_URL) return undefined;
    
    try {
        const url = new URL(PROXY_URL);
        const isSocks = url.protocol === 'socks5:' || url.protocol === 'socks:';
        
        return {
            ip: url.hostname,
            port: parseInt(url.port) || (isSocks ? 1080 : 8080),
            socksType: isSocks ? 5 : undefined,
            username: url.username || undefined,
            password: url.password || undefined,
        };
    } catch (e) {
        console.warn("Invalid PROXY_URL format, ignoring proxy:", e);
        return undefined;
    }
}

// Normalize phone number to consistent E.164 format
function normalizePhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    return '+' + digits;
}

// Map to store active clients: accountId -> Client
const activeClients = new Map<number, TelegramClient>();
// Map to store last sent time: accountId -> timestamp (ms)
const lastSentTime = new Map<number, number>();
// Map to store flood wait end time: accountId -> timestamp when wait ends
const floodWaitUntil = new Map<number, number>();
// Map to store messages sent today per account
const dailyMessageCount = new Map<number, { count: number; resetAt: number }>();
// Map to store contacts imported today per account
const dailyImportCount = new Map<number, { count: number; resetAt: number }>();
// Map to store next allowed send time per account (for randomized delays)
const nextSendTime = new Map<number, number>();

// Safe limits to avoid bans
const SAFE_LIMITS = {
    minDelaySeconds: 30,       // Minimum 30 seconds between messages
    maxDelaySeconds: 90,       // Maximum 90 seconds
    messagesPerHour: 50,       // Max 50 messages per hour
    dailyMessageLimit: 200,    // Max 200 messages per day
    dailyImportLimit: 50,      // Max 50 contact imports per day
    floodWaitBuffer: 10,       // Extra seconds after flood wait
};

// Helper to get random delay between min and max (seconds) -> ms
// Enforces safe minimum but allows higher configured values
function getDelayMs(min: number, max: number) {
    const safeMin = Math.max(min, SAFE_LIMITS.minDelaySeconds);
    const safeMax = Math.max(max, safeMin); // Allow higher max, but at least safeMin
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

// Check and update daily import count
function checkDailyImportLimit(accountId: number): boolean {
    const now = Date.now();
    const stats = dailyImportCount.get(accountId);
    
    // Reset if new day
    if (!stats || now > stats.resetAt) {
        dailyImportCount.set(accountId, { 
            count: 0, 
            resetAt: now + 24 * 60 * 60 * 1000 
        });
        return true;
    }
    
    return stats.count < SAFE_LIMITS.dailyImportLimit;
}

function incrementDailyImportCount(accountId: number) {
    const stats = dailyImportCount.get(accountId);
    if (stats) {
        stats.count++;
    }
}

// Schedule next send with randomized delay
function scheduleNextSend(accountId: number, minSeconds: number, maxSeconds: number) {
    const delay = getDelayMs(minSeconds, maxSeconds);
    nextSendTime.set(accountId, Date.now() + delay);
}

// Check if it's time to send
function canSendNow(accountId: number): boolean {
    const nextTime = nextSendTime.get(accountId);
    if (!nextTime) return true; // First send
    return Date.now() >= nextTime;
}

export class TelegramService {
    // === AUTH METHODS ===
    
    private tempClients = new Map<string, { client: TelegramClient; apiId: number; apiHash: string }>();

    async requestCode(phoneNumber: string, apiId?: number, apiHash?: string) {
        // Use provided credentials or defaults
        const credentials = apiId && apiHash 
            ? { apiId, apiHash } 
            : { apiId: DEFAULT_API_ID, apiHash: DEFAULT_API_HASH };
        
        const proxyConfig = getProxyConfig();
        const client = new TelegramClient(new StringSession(""), credentials.apiId, credentials.apiHash, {
            connectionRetries: 5,
            proxy: proxyConfig,
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

    async testSms(phoneNumber: string) {
        const proxyConfig = getProxyConfig();
        const client = new TelegramClient(new StringSession(""), DEFAULT_API_ID, DEFAULT_API_HASH, {
            connectionRetries: 5,
            proxy: proxyConfig,
        });
        await client.connect();
        
        try {
            await client.sendCode(
                { apiId: DEFAULT_API_ID, apiHash: DEFAULT_API_HASH },
                phoneNumber
            );
        } finally {
            await client.disconnect();
        }
    }

    // QR Code Login
    private qrClients = new Map<string, { 
        client: TelegramClient; 
        token: Buffer; 
        expires: number;
        resolved?: { phoneNumber: string; sessionString: string };
    }>();

    async generateQrToken(): Promise<{ token: string; expires: number; qrId: string }> {
        const qrId = Math.random().toString(36).substring(2, 15);
        const proxyConfig = getProxyConfig();
        const client = new TelegramClient(new StringSession(""), DEFAULT_API_ID, DEFAULT_API_HASH, {
            connectionRetries: 5,
            proxy: proxyConfig,
        });
        await client.connect();

        const result = await client.invoke(
            new Api.auth.ExportLoginToken({
                apiId: DEFAULT_API_ID,
                apiHash: DEFAULT_API_HASH,
                exceptIds: [],
            })
        );

        if (result instanceof Api.auth.LoginToken) {
            const tokenBase64 = result.token.toString('base64url');
            const qrData = { 
                client, 
                token: result.token, 
                expires: result.expires 
            };
            this.qrClients.set(qrId, qrData);
            
            // Set up update handler to detect when user scans QR
            client.addEventHandler(async (update: any) => {
                if (update.className === 'UpdateLoginToken') {
                    console.log('QR Login: UpdateLoginToken received');
                    try {
                        const loginResult = await client.invoke(
                            new Api.auth.ExportLoginToken({
                                apiId: DEFAULT_API_ID,
                                apiHash: DEFAULT_API_HASH,
                                exceptIds: [],
                            })
                        );
                        
                        if (loginResult instanceof Api.auth.LoginTokenSuccess) {
                            const auth = loginResult.authorization;
                            if (auth instanceof Api.auth.Authorization) {
                                const user = auth.user as Api.User;
                                const sessionString = (client.session as StringSession).save();
                                const rawPhone = user.phone || '';
                                const userId = user.id?.toString() || '';
                                
                                let phoneNumber = '';
                                if (rawPhone) {
                                    phoneNumber = normalizePhone(rawPhone);
                                } else if (userId) {
                                    phoneNumber = `@id${userId}`;
                                }
                                
                                console.log(`QR Login success via update: phone="${phoneNumber}"`);
                                
                                const storedQrData = this.qrClients.get(qrId);
                                if (storedQrData) {
                                    storedQrData.resolved = { phoneNumber, sessionString };
                                }
                            }
                        }
                    } catch (e) {
                        console.log('QR update handler error:', e);
                    }
                }
            });
            
            // Auto-cleanup after 2 minutes
            setTimeout(() => {
                const data = this.qrClients.get(qrId);
                if (data && !data.resolved) {
                    data.client.disconnect();
                    this.qrClients.delete(qrId);
                }
            }, 120000);

            return { 
                token: `tg://login?token=${tokenBase64}`, 
                expires: result.expires,
                qrId 
            };
        }
        
        throw new Error("Failed to generate QR login token");
    }

    async checkQrStatus(qrId: string): Promise<{ status: 'pending' | 'success' | 'expired'; phoneNumber?: string; sessionString?: string; token?: string; expires?: number }> {
        const qrData = this.qrClients.get(qrId);
        if (!qrData) return { status: 'expired' };

        // Check if already resolved via update handler
        if (qrData.resolved) {
            const { phoneNumber, sessionString } = qrData.resolved;
            qrData.client.disconnect();
            this.qrClients.delete(qrId);
            return { status: 'success', phoneNumber, sessionString };
        }

        const now = Math.floor(Date.now() / 1000);
        if (now > qrData.expires) {
            qrData.client.disconnect();
            this.qrClients.delete(qrId);
            return { status: 'expired' };
        }

        // Return pending with current token - don't call API, wait for update event
        const tokenBase64 = qrData.token.toString('base64url');
        return { 
            status: 'pending',
            token: `tg://login?token=${tokenBase64}`,
            expires: qrData.expires
        };
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

    // === TEST MESSAGE ===

    async sendTestMessage(account: Account, phone: string, message: string) {
        if (!account.sessionString) {
            throw new Error("Account not authenticated");
        }

        const { apiId, apiHash } = getApiCredentials(account);
        const proxyConfig = getProxyConfig();
        const client = new TelegramClient(
            new StringSession(account.sessionString),
            apiId,
            apiHash,
            { connectionRetries: 5, proxy: proxyConfig }
        );

        try {
            await client.connect();
            
            // Clean the phone number
            const cleanPhone = phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;

            // Try to find user by phone
            let entity: any = null;
            
            // First try as username if it starts with @
            if (phone.startsWith('@')) {
                try {
                    entity = await client.getEntity(phone);
                } catch (e: any) {
                    throw new Error(`Username ${phone} not found in Telegram`);
                }
            } else {
                // Try to find by phone - may need to import contact
                const result = await client.invoke(
                    new Api.contacts.ImportContacts({
                        contacts: [
                            new Api.InputPhoneContact({
                                clientId: BigInt(Math.floor(Math.random() * 1000000)) as any,
                                phone: formattedPhone,
                                firstName: "Test",
                                lastName: "User",
                            }),
                        ],
                    })
                );
                
                if (result.users && result.users.length > 0) {
                    entity = result.users[0];
                } else {
                    // Phone not registered in Telegram
                    throw new Error(`Phone ${formattedPhone} is not registered in Telegram or has privacy settings blocking contact imports`);
                }
            }

            if (!entity) {
                throw new Error(`User not found: ${phone}`);
            }

            await client.sendMessage(entity, { message });
            await storage.addLog(account.id, "info", `Test message sent to ${phone}`);
        } finally {
            await client.disconnect();
        }
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
            const proxyConfig = getProxyConfig();
            
            const client = new TelegramClient(
                new StringSession(account.sessionString),
                apiId,
                apiHash,
                { connectionRetries: 5, proxy: proxyConfig }
            );
            
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
        // Check daily import limit
        if (!checkDailyImportLimit(accountId)) {
            await storage.addLog(accountId, "warn", "Daily contact import limit reached. Skipping phone number.");
            throw new Error("Daily import limit reached");
        }
        
        try {
            // Wait 3-5 seconds BEFORE import (pacing)
            const preDelay = 3000 + Math.random() * 2000;
            await new Promise(r => setTimeout(r, preDelay));
            
            // Import single contact
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
            
            // Increment import counter
            incrementDailyImportCount(accountId);
            
            // Wait 3-5 seconds AFTER import (cooldown)
            const postDelay = 3000 + Math.random() * 2000;
            await new Promise(r => setTimeout(r, postDelay));
            
            if (result.users && result.users.length > 0) {
                await storage.addLog(accountId, "info", `Imported contact: ${phoneNumber}`);
                return result.users[0];
            }
            
            return null;
        } catch (err: any) {
            if (err.message?.includes("FLOOD_WAIT") || err.errorMessage === "FLOOD_WAIT") {
                const waitSeconds = err.seconds || 60;
                floodWaitUntil.set(accountId, Date.now() + (waitSeconds + SAFE_LIMITS.floodWaitBuffer) * 1000);
                await storage.addLog(accountId, "warn", `Import flood wait: ${waitSeconds}s`);
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

            // Check if it's time for next send (respects randomized delays)
            if (!canSendNow(accountId)) {
                const remaining = Math.ceil((nextSendTime.get(accountId)! - Date.now()) / 1000);
                if (remaining > 0) {
                    await storage.updateAccount(accountId, { status: `waiting (${remaining}s)` });
                }
                return;
            } 

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
                        // Not in contacts - try safe import (has internal delays)
                        await storage.addLog(accountId, "info", `Importing contact: ${phoneNumber}`);
                        
                        const user = await this.safeImportContact(client, phoneNumber, accountId);
                        if (!user) {
                            throw new Error(`User not found on Telegram: ${phoneNumber}`);
                        }
                        targetEntity = user;
                    }
                }
                
                await client.sendMessage(targetEntity, { message: messageText });
                
                await storage.updateRecipientStatus(recipient.id, 'sent');
                await storage.addLog(accountId, "info", `Sent to ${recipient.identifier}`);
                
                // Update counters and schedule next send with randomized delay
                incrementDailyCount(accountId);
                const minDelay = Math.max(account.minDelaySeconds || 60, SAFE_LIMITS.minDelaySeconds);
                const maxDelay = Math.max(account.maxDelaySeconds || 180, minDelay);
                scheduleNextSend(accountId, minDelay, maxDelay);
                
                await storage.updateAccount(accountId, { status: "waiting" });
                
            } catch (err: any) {
                const errorMsg = err.message || String(err);
                await storage.updateRecipientStatus(recipient.id, 'failed', errorMsg);
                await storage.addLog(accountId, "error", `Failed: ${recipient.identifier} - ${errorMsg}`);
                
                // Handle FLOOD_WAIT - wait and schedule next send with extra delay
                if (errorMsg.includes("FLOOD_WAIT") || err.errorMessage === "FLOOD_WAIT") {
                    const waitSeconds = err.seconds || 120;
                    const waitUntil = Date.now() + (waitSeconds + SAFE_LIMITS.floodWaitBuffer) * 1000;
                    floodWaitUntil.set(accountId, waitUntil);
                    // Schedule next send with extra delay after flood wait ends (wait + minDelay in ms)
                    const minDelaySeconds = Math.max(account.minDelaySeconds || 60, SAFE_LIMITS.minDelaySeconds);
                    const postWaitDelayMs = minDelaySeconds * 1000;
                    nextSendTime.set(accountId, waitUntil + postWaitDelayMs);
                    await storage.addLog(accountId, "warn", `Flood wait triggered: ${waitSeconds}s. Resuming in ${waitSeconds + minDelaySeconds}s.`);
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
            // Suppress TIMEOUT errors - they're normal network hiccups
            const errMsg = err?.message || String(err);
            if (!errMsg.includes('TIMEOUT') && !errMsg.includes('timeout')) {
                console.error(`Error processing account ${accountId}:`, err);
            }
        }
    }

    // === SCHEDULER (Kyiv Timezone) ===
    private schedulerInterval: NodeJS.Timeout | null = null;

    startScheduler() {
        if (this.schedulerInterval) return;
        
        this.schedulerInterval = setInterval(async () => {
            try {
                await this.checkSchedules();
            } catch (e) {
                console.error("Scheduler error:", e);
            }
        }, 60000); // Check every minute
        
        // Initial check
        this.checkSchedules();
    }

    private async checkSchedules() {
        const accounts = await storage.getAccounts();
        const now = new Date();
        const kyivNow = toZonedTime(now, KYIV_TIMEZONE);
        const kyivTime = `${String(kyivNow.getHours()).padStart(2, '0')}:${String(kyivNow.getMinutes()).padStart(2, '0')}`;
        const dayMap: Record<number, string> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
        const kyivDay = dayMap[kyivNow.getDay()];

        for (const account of accounts) {
            if (account.isRunning) continue; // Already running
            if (account.scheduleType === 'manual') continue;
            if (!account.scheduleTime) continue;

            const shouldStart = 
                (account.scheduleType === 'daily' && account.scheduleTime === kyivTime) ||
                (account.scheduleType === 'weekly' && 
                 account.scheduleTime === kyivTime && 
                 account.scheduleDays?.includes(kyivDay));

            if (shouldStart) {
                await storage.addLog(account.id, "info", `Scheduled start (${KYIV_TIMEZONE})`);
                this.startAccount(account);
            }
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
        this.startScheduler();
    }
}

export const telegramService = new TelegramService();
