import { Router } from "express";
import { requireRole } from "../../shared/guards/auth.guard.js";
import {
  changeMyPasswordHandler,
  resetUserPasswordHandler,
} from "./user.controller.js";

const router = Router();

// Cambio propio de contraseña (requiere sesión global via app.ts)
router.patch("/users/me/password", changeMyPasswordHandler);

// Reset por ADMIN
router.patch(
  "/users/:id/password",
  requireRole(["ADMIN"]),
  resetUserPasswordHandler
);

export default router;
