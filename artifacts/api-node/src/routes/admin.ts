import { Router } from "express";
import { AdminController } from "../controllers/admin";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// Users
router.get("/users", AdminController.listUsers);
router.post("/users", AdminController.storeUser);
router.get("/users/:id", AdminController.getUser);
router.put("/users/:id", AdminController.updateUser);
router.delete("/users/:id", AdminController.deleteUser);

// Departments
router.get("/departments", AdminController.listDepartments);
router.post("/departments", AdminController.storeDepartment);
router.put("/departments/:id", AdminController.updateDepartment);
router.delete("/departments/:id", AdminController.deleteDepartment);

// Roles
router.get("/roles", AdminController.listRoles);
router.post("/roles", AdminController.storeRole);
router.put("/roles/:id", AdminController.updateRole);
router.delete("/roles/:id", AdminController.deleteRole);

// Workflow Rules
router.get("/workflow-rules", AdminController.listWorkflowRules);
router.post("/workflow-rules", AdminController.storeWorkflowRule);
router.delete("/workflow-rules/:id", AdminController.deleteWorkflowRule);

export default router;
