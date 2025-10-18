import { Router } from "express";
import {
  createProductHandler,
  getListOfProductsHandler,
  getProductByIdHandler,
  deactivateProductHandler,
  updateProductHandler,
  incrementProductHandler,
  reactivateProductHandler,
} from "./product.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/products", getListOfProductsHandler);
router.get("/products/:id", getProductByIdHandler);
router.patch(
  "/products/increment",
  requireRole(["ADMIN", "MANAGER"]),
  incrementProductHandler
);
router.post(
  "/products",
  requireRole(["ADMIN", "MANAGER"]),
  createProductHandler
);
router.patch(
  "/products/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updateProductHandler
);
router.patch(
  "/products/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateProductHandler
);
router.patch(
  "/products/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateProductHandler
);

export default router;
