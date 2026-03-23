import { pgTable, serial, text, varchar, timestamp, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const documentStatusEnum = pgEnum("document_status", ["RECEIVED", "IN_TRANSIT", "UNDER_REVIEW", "RETURNED", "SIGNED", "CLOSED"]);
export const digitalSignatureStatusEnum = pgEnum("digital_signature_status", ["UNSIGNED", "SIGNED"]);
export const urgencyLevelEnum = pgEnum("urgency_level", ["LOW", "MEDIUM", "HIGH"]);
export const documentClassificationEnum = pgEnum("document_classification", ["PUBLIC", "CONFIDENTIAL", "SECRET", "TOP_SECRET"]);

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).unique(),
  level: integer("level").default(10),
  canSign: boolean("can_sign").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  departmentId: integer("department_id").references(() => departments.id),
  roleId: integer("role_id").references(() => roles.id),
  isActive: boolean("is_active").default(true),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  referenceNumber: varchar("reference_number", { length: 255 }).notNull().unique(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  status: documentStatusEnum("status").default("RECEIVED").notNull(),
  urgency: urgencyLevelEnum("urgency").default("LOW").notNull(),
  classification: documentClassificationEnum("classification").default("PUBLIC").notNull(),
  digitalSignatureStatus: digitalSignatureStatusEnum("digital_signature_status").default("UNSIGNED").notNull(),
  originatorId: integer("originator_id").references(() => users.id).notNull(),
  currentHolderId: integer("current_holder_id").references(() => users.id).notNull(),
  disposalDate: timestamp("disposal_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const minuteEntries = pgTable("minute_entries", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  action: varchar("action", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentMovements = pgTable("document_movements", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  receivedAt: timestamp("received_at"),
  actionByToUser: varchar("action_by_to_user", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  size: integer("size"),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowRules = pgTable("workflow_rules", {
  id: serial("id").primaryKey(),
  fromDepartmentId: integer("from_department_id").references(() => departments.id),
  toDepartmentId: integer("to_department_id").references(() => departments.id),
  fromRoleId: integer("from_role_id").references(() => roles.id),
  toRoleId: integer("to_role_id").references(() => roles.id),
  ruleType: varchar("rule_type", { length: 50 }).default("AUTO_FORWARD"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, { fields: [users.departmentId], references: [departments.id] }),
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  documentsSent: many(documents, { relationName: "originator" }),
  documentsHeld: many(documents, { relationName: "currentHolder" }),
  movementsFrom: many(documentMovements, { relationName: "fromUser" }),
  movementsTo: many(documentMovements, { relationName: "toUser" }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  originator: one(users, { fields: [documents.originatorId], references: [users.id], relationName: "originator" }),
  currentHolder: one(users, { fields: [documents.currentHolderId], references: [users.id], relationName: "currentHolder" }),
  minutes: many(minuteEntries),
  attachments: many(attachments),
  movements: many(documentMovements),
  auditLogs: many(auditLogs),
}));

export const minuteEntriesRelations = relations(minuteEntries, ({ one }) => ({
  document: one(documents, { fields: [minuteEntries.documentId], references: [documents.id] }),
  user: one(users, { fields: [minuteEntries.userId], references: [users.id] }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  document: one(documents, { fields: [attachments.documentId], references: [documents.id] }),
  uploader: one(users, { fields: [attachments.uploadedBy], references: [users.id] }),
}));

export const documentMovementsRelations = relations(documentMovements, ({ one }) => ({
  document: one(documents, { fields: [documentMovements.documentId], references: [documents.id] }),
  fromUser: one(users, { fields: [documentMovements.fromUserId], references: [users.id], relationName: "fromUser" }),
  toUser: one(users, { fields: [documentMovements.toUserId], references: [users.id], relationName: "toUser" }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  document: one(documents, { fields: [auditLogs.documentId], references: [documents.id] }),
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const workflowRulesRelations = relations(workflowRules, ({ one }) => ({
  fromDepartment: one(departments, { fields: [workflowRules.fromDepartmentId], references: [departments.id] }),
  toDepartment: one(departments, { fields: [workflowRules.toDepartmentId], references: [departments.id] }),
  fromRole: one(roles, { fields: [workflowRules.fromRoleId], references: [roles.id] }),
  toRole: one(roles, { fields: [workflowRules.toRoleId], references: [roles.id] }),
}));

