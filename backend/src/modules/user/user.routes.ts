import { Router } from "express";
import { requireRole } from "../../shared/guards/auth.guard.js";
import {
  createUserHandler,
  deactivateUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  reactivateUserHandler,
  resetUserPasswordHandler,
  updateUserHandler,
} from "./user.controller.js";

const router = Router();

router.get("/users", requireRole(["ADMIN"]), getAllUsersHandler);
router.get("/user/:id", requireRole(["ADMIN"]), getUserByIdHandler);
router.post("/users", requireRole(["ADMIN"]), createUserHandler);
router.patch("/employees/:id", requireRole(["ADMIN"]), updateUserHandler);
router.patch(
  "/employees/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateUserHandler
);
router.patch(
  "/employees/:id/reactivate",
  requireRole(["ADMIN"]),
  reactivateUserHandler
);
router.patch(
  "/users/:id/password",
  requireRole(["ADMIN"]),
  resetUserPasswordHandler
);

export default router;
