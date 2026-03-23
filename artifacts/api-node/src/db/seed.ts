import "dotenv/config";
import { db } from "./index";
import { users, roles, departments } from "./schema";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    console.log("Seeding database...");

    // Create a default department
    const [dept] = await db.insert(departments).values({
      name: "IT Department",
      code: "IT",
      description: "Information Technology",
    }).onConflictDoNothing().returning();

    // Create a default role
    const [role] = await db.insert(roles).values({
      name: "Administrator",
      code: "ADMIN",
      description: "Full system access",
    }).onConflictDoNothing().returning();

    const adminDeptId = dept?.id || 1;
    const adminRoleId = role?.id || 1;

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      name: "System Admin",
      email: "admin@example.com",
      password: hashedPassword,
      departmentId: adminDeptId,
      roleId: adminRoleId,
    }).onConflictDoNothing();

    console.log("Seeding completed. Admin: admin@example.com / admin123");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
