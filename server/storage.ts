import { db } from "./db";
import {
  accounts, accountGroups, recipients, logs,
  type Account, type AccountGroup, type Recipient, type Log,
  type CreateAccountRequest, type UpdateAccountRequest,
  type CreateAccountGroupRequest, type UpdateAccountGroupRequest
} from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByPhone(phone: string): Promise<Account | undefined>;
  createAccount(account: CreateAccountRequest & { sessionString?: string, status?: string }): Promise<Account>;
  updateAccount(id: number, updates: UpdateAccountRequest & { sessionString?: string, status?: string, lastError?: string }): Promise<Account>;
  deleteAccount(id: number): Promise<void>;

  // Groups
  getGroups(): Promise<AccountGroup[]>;
  getGroup(id: number): Promise<AccountGroup | undefined>;
  createGroup(group: CreateAccountGroupRequest): Promise<AccountGroup>;
  updateGroup(id: number, updates: UpdateAccountGroupRequest): Promise<AccountGroup>;
  deleteGroup(id: number): Promise<void>;

  // Recipients
  getRecipients(accountId: number): Promise<Recipient[]>;
  addRecipients(accountId: number, identifiers: string[]): Promise<void>;
  updateRecipientStatus(id: number, status: string, error?: string): Promise<void>;
  getNextPendingRecipient(accountId: number): Promise<Recipient | undefined>;
  clearRecipients(accountId: number): Promise<void>;

  // Logs
  addLog(accountId: number | null, level: string, message: string): Promise<void>;
  getLogs(limit?: number): Promise<Log[]>;
  
  // Stats
  getStats(): Promise<{
      totalAccounts: number,
      activeAccounts: number,
      messagesSent: number,
      errors: number
  }>;
}

export class DatabaseStorage implements IStorage {
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(accounts.id);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async getAccountByPhone(phone: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.phoneNumber, phone));
    return account;
  }

  async createAccount(account: CreateAccountRequest & { sessionString?: string, status?: string }): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async updateAccount(id: number, updates: UpdateAccountRequest & { sessionString?: string, status?: string, lastError?: string }): Promise<Account> {
    const [updated] = await db.update(accounts).set(updates).where(eq(accounts.id, id)).returning();
    return updated;
  }

  async deleteAccount(id: number): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }

  async getGroups(): Promise<AccountGroup[]> {
    return await db.select().from(accountGroups);
  }

  async getGroup(id: number): Promise<AccountGroup | undefined> {
    const [group] = await db.select().from(accountGroups).where(eq(accountGroups.id, id));
    return group;
  }

  async createGroup(group: CreateAccountGroupRequest): Promise<AccountGroup> {
    const [newGroup] = await db.insert(accountGroups).values(group).returning();
    return newGroup;
  }

  async updateGroup(id: number, updates: UpdateAccountGroupRequest): Promise<AccountGroup> {
    const [updated] = await db.update(accountGroups).set(updates).where(eq(accountGroups.id, id)).returning();
    return updated;
  }

  async deleteGroup(id: number): Promise<void> {
    await db.delete(accountGroups).where(eq(accountGroups.id, id));
  }

  async getRecipients(accountId: number): Promise<Recipient[]> {
    return await db.select().from(recipients).where(eq(recipients.accountId, accountId));
  }

  async addRecipients(accountId: number, identifiers: string[]): Promise<void> {
    if (identifiers.length === 0) return;
    await db.insert(recipients).values(
      identifiers.map(id => ({ accountId, identifier: id, status: 'pending' }))
    );
  }

  async updateRecipientStatus(id: number, status: string, error?: string): Promise<void> {
    await db.update(recipients)
      .set({ status, errorMessage: error, sentAt: status === 'sent' ? new Date() : null })
      .where(eq(recipients.id, id));
  }

  async getNextPendingRecipient(accountId: number): Promise<Recipient | undefined> {
    const [recipient] = await db.select()
      .from(recipients)
      .where(sql`${recipients.accountId} = ${accountId} AND ${recipients.status} = 'pending'`)
      .limit(1);
    return recipient;
  }
  
  async clearRecipients(accountId: number): Promise<void> {
      await db.delete(recipients).where(eq(recipients.accountId, accountId));
  }

  async addLog(accountId: number | null, level: string, message: string): Promise<void> {
    await db.insert(logs).values({ accountId, level, message });
  }
  
  async getLogs(limit: number = 100): Promise<Log[]> {
      return await db.select().from(logs).orderBy(desc(logs.createdAt)).limit(limit);
  }

  async getStats() {
      const allAccounts = await this.getAccounts();
      const active = allAccounts.filter(a => a.isRunning).length;
      
      const [sentResult] = await db.select({ count: sql<number>`count(*)` }).from(recipients).where(eq(recipients.status, 'sent'));
      const [errorResult] = await db.select({ count: sql<number>`count(*)` }).from(recipients).where(eq(recipients.status, 'failed'));
      
      return {
          totalAccounts: allAccounts.length,
          activeAccounts: active,
          messagesSent: Number(sentResult.count),
          errors: Number(errorResult.count)
      };
  }
}

export const storage = new DatabaseStorage();
