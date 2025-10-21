import { Router } from "express";
import {
  createAccountHandler,
  getAllAccountsHandler,
  getAccountByIdHandler,
  deactivateAccountHandler,
  updateAccountHandler,
  reactivateAccountHandler,
  reactivateSwapAccountHandler,
} from "./account.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/accounts", getAllAccountsHandler);
router.get("/accounts/:id", getAccountByIdHandler);
router.post(
  "/accounts",
  requireRole(["ADMIN", "MANAGER"]),
  createAccountHandler
);
router.patch(
  "/accounts/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updateAccountHandler
);
router.patch(
  "/accounts/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateAccountHandler
);
router.patch(
  "/accounts/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateAccountHandler
);
router.patch(
  "/accounts/:inactiveId/reactivate-swap",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateSwapAccountHandler
);

export default router;
