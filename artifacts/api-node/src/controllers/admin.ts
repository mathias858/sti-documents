import { Request, Response } from "express";
import { db } from "../db";
import { users, departments, roles, workflowRules } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export class AdminController {
  // ── Users ──────────────────────────────────────────────
  static async listUsers(req: Request, res: Response) {
    try {
      const data = await db.query.users.findMany({
        with: { department: true, role: true },
      });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async storeUser(req: Request, res: Response) {
    const { name, email, password, departmentId, roleId, isAdmin } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password || "password123", 10);
      const [user] = await db.insert(users).values({
        name, email, password: hashedPassword, departmentId, roleId, isAdmin: isAdmin || false,
      }).returning();
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(req.params.id)),
        with: { department: true, role: true },
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { name, email, departmentId, roleId, isActive } = req.body;
    try {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (departmentId !== undefined) updateData.departmentId = departmentId;
      if (roleId !== undefined) updateData.roleId = roleId;
      if (isActive !== undefined) updateData.isActive = isActive;

      const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating user" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await db.delete(users).where(eq(users.id, parseInt(req.params.id)));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting user" });
    }
  }

  // ── Departments ────────────────────────────────────────
  static async listDepartments(req: Request, res: Response) {
    try {
      res.json(await db.select().from(departments));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async storeDepartment(req: Request, res: Response) {
    try {
      const [data] = await db.insert(departments).values(req.body).returning();
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating department" });
    }
  }

  static async updateDepartment(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    try {
      const [updated] = await db.update(departments).set(req.body).where(eq(departments.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Department not found" });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating department" });
    }
  }

  static async deleteDepartment(req: Request, res: Response) {
    try {
      await db.delete(departments).where(eq(departments.id, parseInt(req.params.id)));
      res.json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting department" });
    }
  }

  // ── Roles ──────────────────────────────────────────────
  static async listRoles(req: Request, res: Response) {
    try {
      res.json(await db.select().from(roles));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async storeRole(req: Request, res: Response) {
    try {
      const [data] = await db.insert(roles).values(req.body).returning();
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating role" });
    }
  }

  static async updateRole(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    try {
      const [updated] = await db.update(roles).set(req.body).where(eq(roles.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Role not found" });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating role" });
    }
  }

  static async deleteRole(req: Request, res: Response) {
    try {
      await db.delete(roles).where(eq(roles.id, parseInt(req.params.id)));
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting role" });
    }
  }

  // ── Workflow Rules ─────────────────────────────────────
  static async listWorkflowRules(req: Request, res: Response) {
    try {
      const data = await db.query.workflowRules.findMany({
        with: {
          fromDepartment: true,
          toDepartment: true,
          fromRole: true,
          toRole: true,
        },
      });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async storeWorkflowRule(req: Request, res: Response) {
    try {
      const [data] = await db.insert(workflowRules).values(req.body).returning();
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating workflow rule" });
    }
  }

  static async deleteWorkflowRule(req: Request, res: Response) {
    try {
      await db.delete(workflowRules).where(eq(workflowRules.id, parseInt(req.params.id)));
      res.json({ message: "Workflow rule deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting workflow rule" });
    }
  }
}
