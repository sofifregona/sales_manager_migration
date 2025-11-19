import { Router } from "express";
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  deactivateCategoryHandler,
  reactivateCategoryHandler,
  reactivateSwapCategoryHandler,
  updateCategoryHandler,
} from "./category.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/categories", getAllCategoriesHandler);
router.get("/categories/:id", getCategoryByIdHandler);
router.post(
  "/categories",
  requireRole(["ADMIN", "MANAGER"]),
  createCategoryHandler
);
router.patch(
  "/categories/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updateCategoryHandler
);
router.patch(
  "/categories/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateCategoryHandler
);
router.patch(
  "/categories/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateCategoryHandler
);
router.post(
  "/categories/:inactiveId/reactivate-swap",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateSwapCategoryHandler
);

export default router;
