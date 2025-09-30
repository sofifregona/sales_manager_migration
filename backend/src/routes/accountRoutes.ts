import { Router } from "express";
import {
  createAccountHandler,
  getAllAccountsHandler,
  getAccountByIdHandler,
  deactivateAccountHandler,
  updateAccountHandler,
} from "../controllers/accountController.js";

const router = Router();

router.get("/accounts", getAllAccountsHandler);
router.get("/accounts/:id", getAccountByIdHandler);
router.post("/accounts", createAccountHandler);
router.patch("/accounts/:id", updateAccountHandler);
router.patch("/accounts/:id/deactivate", deactivateAccountHandler);

export default router;
