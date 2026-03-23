import { db } from "./src/db";
import { users } from "./src/db/schema";
import "dotenv/config";

async function listUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log("Existing Users:", JSON.stringify(allUsers, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Failed to list users:", error);
    process.exit(1);
  }
}

listUsers();
