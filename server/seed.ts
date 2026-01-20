import { storage } from "./storage";
import { accounts } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if we have any accounts
  const existingAccounts = await storage.getAccounts();
  if (existingAccounts.length > 0) {
    console.log("Accounts already exist, skipping seed.");
    return;
  }

  // Create an example group
  const group = await storage.createGroup({
    name: "Marketing Campaign A",
    messageTemplate: "Hello! We have a special offer for you. Check it out at https://example.com",
  });

  // Create some example accounts (mock data, won't actually work without real auth)
  // We set them to 'idle' status.
  await storage.createAccount({
    phoneNumber: "+1234567890",
    sessionString: "mock_session_string_1",
    apiId: 12345,
    apiHash: "mock_hash",
    status: "idle",
    groupId: group.id,
    minDelaySeconds: 30,
    maxDelaySeconds: 60,
  });

  await storage.createAccount({
    phoneNumber: "+0987654321",
    sessionString: "mock_session_string_2",
    apiId: 12345,
    apiHash: "mock_hash",
    status: "error", // Simulate one in error state
    lastError: "Auth key invalid",
    groupId: group.id,
  });

  // Add logs
  await storage.addLog(null, "info", "System initialized");
  await storage.addLog(1, "info", "Account created");
  
  console.log("Seeding complete!");
}

seed().catch(console.error);
