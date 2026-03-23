import "dotenv/config";
import { Client } from "pg";
import fs from "fs";
import path from "path";

const run = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    const sqlPath = path.join(__dirname, "../../drizzle/0000_thin_storm.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Split statements by drizzle's breakpoint
    const statements = sql.split("--> statement-breakpoint");

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (err: any) {
          // Ignore "already exists" errors for types and tables if it's a re-run
          if (err.code === "42P07" || err.code === "42710") {
            console.log(`Skipping: ${err.message}`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
