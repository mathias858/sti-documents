import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";
import authRoutes from "./routes/auth";
import documentRoutes from "./routes/documents";
import adminRoutes from "./routes/admin";
import { authMiddleware } from "./middleware/auth";
import { DocumentController } from "./controllers/documents";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api", adminRoutes);

// Attachment download (outside of documents router since it's /api/attachments/:id/download)
app.get("/api/attachments/:id/download", authMiddleware, DocumentController.downloadAttachment);

// Audit logs endpoint
app.get("/api/audit-logs", authMiddleware, async (req, res) => {
  try {
    const { db } = await import("./db");
    const { auditLogs } = await import("./db/schema");
    const logs = await db.select().from(auditLogs);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
