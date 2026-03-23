import { Request, Response } from "express";
import { db } from "../db";
import { documents, minuteEntries, auditLogs, users, attachments, documentMovements } from "../db/schema";
import { eq, and, or, desc } from "drizzle-orm";

export class DocumentController {
  static async list(req: Request, res: Response) {
    const userId = (req as any).user.id;
    try {
      const docs = await db.query.documents.findMany({
        where: or(eq(documents.originatorId, userId), eq(documents.currentHolderId, userId)),
        with: {
          originator: { with: { department: true } },
          currentHolder: { with: { department: true } },
        },
      });
      res.json(docs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async show(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    try {
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, id),
        with: {
          originator: { with: { department: true } },
          currentHolder: { with: { department: true } },
          minutes: { with: { user: true } },
          attachments: true,
          movements: true,
        },
      });
      if (!doc) return res.status(404).json({ message: "Document not found" });
      res.json(doc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async store(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { subject, referenceNumber, description, urgency, classification, disposalDate } = req.body;
    try {
      const [doc] = await db.insert(documents).values({
        subject,
        referenceNumber,
        description,
        urgency: (urgency || "LOW").toUpperCase() as any,
        classification: (classification || "PUBLIC").toUpperCase() as any,
        originatorId: userId,
        currentHolderId: userId,
        disposalDate: disposalDate ? new Date(disposalDate) : null,
      }).returning();

      await db.insert(minuteEntries).values({
        documentId: doc.id, userId, text: `Document registered: ${subject}`, action: "REGISTERED",
      });
      await db.insert(auditLogs).values({
        documentId: doc.id, userId, action: "DOCUMENT_REGISTERED", details: JSON.stringify({ referenceNumber }),
      });

      res.status(201).json(doc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating document" });
    }
  }

  static async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { subject, description, urgency, classification, status } = req.body;
    try {
      const updateData: any = {};
      if (subject !== undefined) updateData.subject = subject;
      if (description !== undefined) updateData.description = description;
      if (urgency !== undefined) updateData.urgency = urgency;
      if (classification !== undefined) updateData.classification = classification;
      if (status !== undefined) updateData.status = status;

      const [updated] = await db.update(documents).set(updateData).where(eq(documents.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Document not found" });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating document" });
    }
  }

  static async forward(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userId = (req as any).user.id;
    const { toUserId, minuteText } = req.body;
    try {
      await db.update(documents).set({ currentHolderId: toUserId, status: "IN_TRANSIT" }).where(eq(documents.id, id));
      await db.insert(minuteEntries).values({ documentId: id, userId, text: minuteText || "Forwarded", action: "FORWARDED" });
      await db.insert(documentMovements).values({ documentId: id, fromUserId: userId, toUserId });
      await db.insert(auditLogs).values({ documentId: id, userId, action: "DOCUMENT_FORWARDED", details: JSON.stringify({ toUserId }) });

      res.json({ message: "Document forwarded successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error forwarding document" });
    }
  }

  static async sign(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userId = (req as any).user.id;
    try {
      await db.update(documents).set({ digitalSignatureStatus: "SIGNED" }).where(eq(documents.id, id));
      await db.insert(minuteEntries).values({ documentId: id, userId, text: "Document signed digitally", action: "SIGNED" });
      await db.insert(auditLogs).values({ documentId: id, userId, action: "DOCUMENT_SIGNED" });

      res.json({ message: "Document signed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error signing document" });
    }
  }

  // ── Minutes ────────────────────────────────────────────
  static async listMinutes(req: Request, res: Response) {
    const documentId = parseInt(req.params.id);
    try {
      const minutes = await db.query.minuteEntries.findMany({
        where: eq(minuteEntries.documentId, documentId),
        with: { user: true },
      });
      res.json(minutes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async addMinute(req: Request, res: Response) {
    const documentId = parseInt(req.params.id);
    const userId = (req as any).user.id;
    const { text, action } = req.body;
    try {
      const [minute] = await db.insert(minuteEntries).values({
        documentId, userId, text, action: action || "NOTE",
      }).returning();
      res.status(201).json(minute);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding minute" });
    }
  }

  // ── Movements ──────────────────────────────────────────
  static async listMovements(req: Request, res: Response) {
    const documentId = parseInt(req.params.id);
    try {
      const movements = await db.select().from(documentMovements).where(eq(documentMovements.documentId, documentId));
      res.json(movements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // ── Attachments ────────────────────────────────────────
  static async listAttachments(req: Request, res: Response) {
    const documentId = parseInt(req.params.id);
    try {
      const atts = await db.select().from(attachments).where(eq(attachments.documentId, documentId));
      res.json(atts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async attach(req: Request, res: Response) {
    const documentId = parseInt(req.params.id);
    const userId = (req as any).user.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    try {
      const [attachment] = await db.insert(attachments).values({
        documentId, filename: file.filename, originalName: file.originalname,
        mimeType: file.mimetype, size: file.size, uploadedBy: userId,
      }).returning();

      await db.insert(auditLogs).values({
        documentId, userId, action: "ATTACHMENT_ADDED", details: JSON.stringify({ filename: file.originalname }),
      });

      res.status(201).json(attachment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error saving attachment" });
    }
  }

  static async downloadAttachment(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const path = require("path");
    const fs = require("fs");

    try {
      const [att] = await db.select().from(attachments).where(eq(attachments.id, id));
      if (!att) return res.status(404).json({ message: "Attachment not found" });

      const filePath = path.resolve(process.cwd(), "uploads", att.filename);
      
      if (!fs.existsSync(filePath)) {
        console.error(`File not found on disk: ${filePath}`);
        return res.status(404).json({ message: "Physical file not found on server" });
      }

      res.download(filePath, att.originalName);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error downloading attachment" });
    }
  }
}
