import { Router } from "express";
import { DocumentController } from "../controllers/documents";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = Router();

router.use(authMiddleware);

// Documents CRUD
router.get("/", DocumentController.list);
router.post("/", DocumentController.store);
router.get("/:id", DocumentController.show);
router.put("/:id", DocumentController.update);

// Document Actions
router.post("/:id/forward", DocumentController.forward);
router.post("/:id/sign", DocumentController.sign);

// Minutes
router.get("/:id/minutes", DocumentController.listMinutes);
router.post("/:id/minutes", DocumentController.addMinute);

// Movements
router.get("/:id/movements", DocumentController.listMovements);

// Attachments
router.get("/:id/attachments", DocumentController.listAttachments);
router.post("/:id/attachments", upload.single("file"), DocumentController.attach);

export default router;
