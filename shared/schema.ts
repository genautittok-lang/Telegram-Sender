import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const accountGroups = pgTable("account_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  messageTemplate: text("message_template"), // Shared message text
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  sessionString: text("session_string"), // Auth token
  apiId: integer("api_id"), // Optional: custom API ID per account
  apiHash: text("api_hash"), // Optional: custom API Hash per account
  proxyUrl: text("proxy_url"), // e.g., socks5://user:pass@host:port
  
  groupId: integer("group_id").references(() => accountGroups.id),
  
  messageTemplate: text("message_template"), // Individual message text (override)
  
  // Status & Settings
  isRunning: boolean("is_running").default(false),
  status: text("status").default("idle"), // idle, waiting, sending, error, re-auth-needed
  lastError: text("last_error"),
  
  minDelaySeconds: integer("min_delay_seconds").default(60),
  maxDelaySeconds: integer("max_delay_seconds").default(180),
  
  // Scheduling
  scheduleType: text("schedule_type").default("manual"), // manual, daily, weekly
  scheduleTime: text("schedule_time"), // HH:MM format
  scheduleDays: text("schedule_days").array(), // For weekly: ['mon', 'tue', 'wed', ...]
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: 'cascade' }),
  identifier: text("identifier").notNull(), // username or phone
  status: text("status").default("pending"), // pending, sent, failed
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: 'set null' }),
  level: text("level").notNull(), // info, warn, error
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const accountGroupsRelations = relations(accountGroups, ({ many }) => ({
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  group: one(accountGroups, {
    fields: [accounts.groupId],
    references: [accountGroups.id],
  }),
  recipients: many(recipients),
  logs: many(logs),
}));

export const recipientsRelations = relations(recipients, ({ one }) => ({
  account: one(accounts, {
    fields: [recipients.accountId],
    references: [accounts.id],
  }),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  account: one(accounts, {
    fields: [logs.accountId],
    references: [accounts.id],
  }),
}));

// === ZOD SCHEMAS ===

export const insertAccountGroupSchema = createInsertSchema(accountGroups).omit({ id: true, createdAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, sessionString: true, lastError: true, status: true });
export const insertRecipientSchema = createInsertSchema(recipients).omit({ id: true, sentAt: true, status: true, errorMessage: true });

// === EXPLICIT API TYPES ===

export type AccountGroup = typeof accountGroups.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Recipient = typeof recipients.$inferSelect;
export type Log = typeof logs.$inferSelect;

export type CreateAccountGroupRequest = z.infer<typeof insertAccountGroupSchema>;
export type UpdateAccountGroupRequest = Partial<CreateAccountGroupRequest>;

export type CreateAccountRequest = z.infer<typeof insertAccountSchema>;
export type UpdateAccountRequest = Partial<CreateAccountRequest> & {
  // Allow updating status/running state manually if needed
  isRunning?: boolean;
};

// Auth steps - simplified (no API credentials needed from user)
export type AuthRequestCodeRequest = {
  phoneNumber: string;
};

export type AuthSignInRequest = {
  phoneNumber: string;
  phoneCode: string;
  phoneCodeHash: string;
  password?: string; // 2FA
};

export type BulkAddRecipientsRequest = {
  accountId: number;
  identifiers: string[]; // List of usernames/phones
};

export type GlobalControlRequest = {
  action: "start_all" | "stop_all" | "pause_all";
};
