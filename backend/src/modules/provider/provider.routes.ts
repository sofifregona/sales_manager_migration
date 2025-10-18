import { Router } from "express";
import {
  createProviderHandler,
  getAllProvidersHandler,
  getProviderByIdHandler,
  deactivateProviderHandler,
  updateProviderHandler,
  reactivateProviderHandler,
} from "./provider.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/providers", getAllProvidersHandler);
router.get("/providers/:id", getProviderByIdHandler);
router.post(
  "/providers",
  requireRole(["ADMIN", "MANAGER"]),
  createProviderHandler
);
router.patch(
  "/providers/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updateProviderHandler
);
router.patch(
  "/providers/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateProviderHandler
);
router.patch(
  "/providers/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateProviderHandler
);

export default router;
