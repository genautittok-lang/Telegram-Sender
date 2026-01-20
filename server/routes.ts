import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { telegramService } from "./telegram";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize Telegram Service (restores running accounts)
  telegramService.initialize();

  // === ACCOUNTS ===
  
  app.get(api.accounts.list.path, async (req, res) => {
    const accounts = await storage.getAccounts();
    res.json(accounts);
  });

  app.get(api.accounts.get.path, async (req, res) => {
    const account = await storage.getAccount(Number(req.params.id));
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  });

  app.patch(api.accounts.update.path, async (req, res) => {
    try {
        const input = api.accounts.update.input.parse(req.body);
        const account = await storage.updateAccount(Number(req.params.id), input);
        if (!account) return res.status(404).json({ message: "Account not found" });
        res.json(account);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
    }
  });
  
  app.delete(api.accounts.delete.path, async (req, res) => {
      await telegramService.stopAccount(Number(req.params.id)); // Stop before delete
      await storage.deleteAccount(Number(req.params.id));
      res.sendStatus(204);
  });

  app.post(api.accounts.start.path, async (req, res) => {
      const account = await storage.getAccount(Number(req.params.id));
      if (!account) return res.status(404).json({ message: "Account not found" });
      
      telegramService.startAccount(account);
      res.json({ success: true });
  });

  app.post(api.accounts.stop.path, async (req, res) => {
      telegramService.stopAccount(Number(req.params.id));
      res.json({ success: true });
  });

  // === GROUPS ===

  app.get(api.groups.list.path, async (req, res) => {
    const groups = await storage.getGroups();
    res.json(groups);
  });

  app.post(api.groups.create.path, async (req, res) => {
      const input = api.groups.create.input.parse(req.body);
      const group = await storage.createGroup(input);
      res.status(201).json(group);
  });

  app.patch(api.groups.update.path, async (req, res) => {
      const input = api.groups.update.input.parse(req.body);
      const group = await storage.updateGroup(Number(req.params.id), input);
      res.json(group);
  });

  app.delete(api.groups.delete.path, async (req, res) => {
      await storage.deleteGroup(Number(req.params.id));
      res.sendStatus(204);
  });

  // === RECIPIENTS ===

  app.get(api.recipients.list.path, async (req, res) => {
      const recipients = await storage.getRecipients(Number(req.params.accountId));
      res.json(recipients);
  });

  app.post(api.recipients.bulkAdd.path, async (req, res) => {
      const { identifiers } = req.body; // Basic validation via manual check or use schema
      if (!Array.isArray(identifiers)) return res.status(400).json({ message: "Identifiers must be an array" });
      
      await storage.addRecipients(Number(req.params.accountId), identifiers);
      res.json({ added: identifiers.length });
  });
  
  app.delete(api.recipients.clear.path, async (req, res) => {
      await storage.clearRecipients(Number(req.params.accountId));
      res.sendStatus(204);
  });

  // === AUTH ===

  app.post(api.auth.requestCode.path, async (req, res) => {
      try {
          const { phoneNumber } = api.auth.requestCode.input.parse(req.body);
          const phoneCodeHash = await telegramService.requestCode(phoneNumber);
          res.json({ phoneCodeHash });
      } catch (err: any) {
          res.status(400).json({ message: err.message });
      }
  });

  app.post(api.auth.signIn.path, async (req, res) => {
      try {
          const { phoneNumber, phoneCode, phoneCodeHash, password } = api.auth.signIn.input.parse(req.body);
          const sessionString = await telegramService.signIn(phoneNumber, phoneCode, phoneCodeHash, password);
          
          // Check if account exists, update it. If not, create it.
          const existing = await storage.getAccountByPhone(phoneNumber);
          if (existing) {
              await storage.updateAccount(existing.id, { sessionString, status: 'idle' });
          } else {
              await storage.createAccount({ 
                  phoneNumber, 
                  sessionString, 
                  status: 'idle',
                  minDelaySeconds: 60,
                  maxDelaySeconds: 180
              });
          }
          
          res.json({ success: true });
      } catch (err: any) {
          res.status(400).json({ message: err.message });
      }
  });

  // === CONTROL ===

  app.post(api.control.global.path, async (req, res) => {
      const { action } = req.body;
      const accounts = await storage.getAccounts();
      
      if (action === 'start_all') {
          for (const acc of accounts) telegramService.startAccount(acc);
      } else if (action === 'stop_all' || action === 'pause_all') {
          for (const acc of accounts) telegramService.stopAccount(acc.id);
      }
      
      res.json({ success: true, message: `Executed ${action}` });
  });

  // === STATS & LOGS ===

  app.get(api.stats.get.path, async (req, res) => {
      const stats = await storage.getStats();
      res.json(stats);
  });

  app.get(api.logs.list.path, async (req, res) => {
      const logs = await storage.getLogs();
      res.json(logs);
  });

  return httpServer;
}
