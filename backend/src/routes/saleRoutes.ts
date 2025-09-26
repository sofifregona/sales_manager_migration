import { Router } from "express";
import {
  createSaleHandler,
  getAllSalesHandler,
  getSaleByIdHandler,
  updateSaleHandler,
} from "../controllers/saleController.js";

const router = Router();

router.post("/sales", createSaleHandler);
router.get("/sales", getAllSalesHandler);
router.get("/sales/:id", getSaleByIdHandler);
router.patch("/sales/:id", updateSaleHandler);
// router.patch("/sales/:id/deactivate", deactivateSaleHandler);

export default router;
