import { Router } from "express";
import {
  createBrandHandler,
  getAllBrandsHandler,
  getBrandByIdHandler,
  deactivateBrandHandler,
  updateBrandHandler,
  reactivateBrandHandler,
  reactivateSwapBrandHandler,
} from "./brand.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/brands", getAllBrandsHandler);
router.get("/brands/:id", getBrandByIdHandler);
router.post("/brands", requireRole(["ADMIN", "MANAGER"]), createBrandHandler);
router.patch(
  "/brands/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updateBrandHandler
);
router.patch(
  "/brands/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateBrandHandler
);
router.patch(
  "/brands/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateBrandHandler
);
router.post(
  "/brands/:inactiveId/reactivate-swap",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateSwapBrandHandler
);

export default router;
