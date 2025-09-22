import { Router } from "express";
import { createPaymentHandler, getAllPaymentsHandler, getPaymentByIdHandler, deactivatePaymentHandler, updatePaymentHandler, } from "../controllers/paymentController.js";
const router = Router();
router.post("/payments", createPaymentHandler);
router.get("/payments", getAllPaymentsHandler);
router.get("/payments/:id", getPaymentByIdHandler);
router.patch("/payments/:id", updatePaymentHandler);
router.patch("/payments/:id/deactivate", deactivatePaymentHandler);
export default router;
