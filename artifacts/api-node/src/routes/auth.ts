import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/login", AuthController.login);
router.get("/me", authMiddleware, AuthController.me);
router.post("/change-password", authMiddleware, AuthController.changePassword);

export default router;
