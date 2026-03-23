import "dotenv/config";
import { db } from "./src/db";
import { attachments } from "./src/db/schema";

async function checkAttachments() {
  try {
    const allAttachments = await db.select().from(attachments);
    console.log("Attachments in DB:");
    console.log(JSON.stringify(allAttachments, null, 2));
  } catch (error) {
    console.error("Error checking attachments:", error);
  } finally {
    process.exit(0);
  }
}

checkAttachments();
