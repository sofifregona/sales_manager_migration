import { Router } from "express";
import {
  createTransactionHandler,
  getListOfTransactionsHandler,
  getTransactionByIdHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
} from "./transaction.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/transactions", getListOfTransactionsHandler);
router.get("/transactions/:id", getTransactionByIdHandler);
router.post("/transactions", createTransactionHandler);
router.patch("/transactions/:id", updateTransactionHandler);
router.patch(
  "/transactions/:id/delete",
  requireRole(["ADMIN"]),
  deleteTransactionHandler
);

export default router;
