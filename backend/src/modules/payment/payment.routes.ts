import { Router } from "express";
import {
  createPaymentHandler,
  getAllPaymentsHandler,
  getPaymentByIdHandler,
  deactivatePaymentHandler,
  updatePaymentHandler,
  reactivatePaymentHandler,
} from "./payment.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/payments", getAllPaymentsHandler);
router.get("/payments/:id", getPaymentByIdHandler);
router.post(
  "/payments",
  requireRole(["ADMIN", "MANAGER"]),
  createPaymentHandler
);
router.patch(
  "/payments/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updatePaymentHandler
);
router.patch(
  "/payments/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivatePaymentHandler
);
router.patch(
  "/payments/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivatePaymentHandler
);

export default router;
