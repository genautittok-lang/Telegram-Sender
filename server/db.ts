import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Add automatic table creation on pool connect
pool.on('connect', async (client) => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        phone_number TEXT NOT NULL UNIQUE,
        session_string TEXT,
        api_id INTEGER,
        api_hash TEXT,
        proxy_url TEXT,
        group_id INTEGER,
        message_template TEXT DEFAULT '',
        is_running BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'idle',
        last_error TEXT,
        min_delay_seconds INTEGER DEFAULT 5,
        max_delay_seconds INTEGER DEFAULT 10,
        schedule_type TEXT DEFAULT 'manual',
        schedule_time TEXT DEFAULT '09:00',
        schedule_days TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS account_groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        message_template TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS recipients (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
        identifier TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database tables verified/created via pool");
  } catch (err) {
    console.error("Error creating tables on connect:", err);
  }
});

export const db = drizzle(pool, { schema });
