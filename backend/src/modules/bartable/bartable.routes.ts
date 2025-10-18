import { Router } from "express";
import {
  createBartableHandler,
  getAllBartablesHandler,
  getBartableByIdHandler,
  deactivateBartableHandler,
  updateBartableHandler,
  reactivateAccountHandler,
} from "./bartable.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/bartables", getAllBartablesHandler);
router.get("/bartables/:id", getBartableByIdHandler);
router.post(
  "/bartables",
  requireRole(["ADMIN", "MANAGER"]),
  createBartableHandler
);
router.patch(
  "/bartables/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updateBartableHandler
);
router.patch(
  "/bartables/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateBartableHandler
);
router.patch(
  "/bartables/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateAccountHandler
);

export default router;
