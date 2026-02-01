import { Router } from "express";
import {
  createPaymentMethodHandler,
  getAllPaymentMethodsHandler,
  getPaymentMethodByIdHandler,
  deactivatePaymentMethodHandler,
  updatePaymentMethodHandler,
  reactivatePaymentMethodHandler,
  reactivateSwapPaymentMethodHandler,
} from "./payment-method.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/payment-methods", getAllPaymentMethodsHandler);
router.get("/payment-methods/:id", getPaymentMethodByIdHandler);
router.post(
  "/payment-methods",
  requireRole(["ADMIN", "MANAGER"]),
  createPaymentMethodHandler
);
router.patch(
  "/payment-methods/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updatePaymentMethodHandler
);
router.patch(
  "/payment-methods/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivatePaymentMethodHandler
);
router.patch(
  "/payment-methods/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivatePaymentMethodHandler
);

// Reactivar con swap (inactiva <-> actual)
router.post(
  "/payment-methods/:inactiveId/reactivate-swap",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateSwapPaymentMethodHandler
);

export default router;
