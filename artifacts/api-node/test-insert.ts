import "dotenv/config";
import { db } from "./src/db";
import { roles } from "./src/db/schema";

async function run() {
  try {
    const data = { name: "TestRole", level: 10, canSign: false, description: "test" };
    console.log("Attempting to insert:", data);
    const [res] = await db.insert(roles).values(data).returning();
    console.log("Success:", res);
  } catch (e) {
    console.error("Error inserting:", e);
  }
}

run().finally(() => process.exit(0));
