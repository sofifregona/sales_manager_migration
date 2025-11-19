import { Router } from "express";
import {
  createSaleHandler,
  getAllSalesHandler,
  getListOfSalesHandler,
  getSaleByIdHandler,
  updateSaleHandler,
  closeSaleHandler,
  deleteSaleHandler,
} from "./sale.controller.js";
import { requireRole } from "@back/src/shared/guards/auth.guard.js";

const router = Router();

router.get("/sales", getAllSalesHandler);
router.get("/sales/filter", getListOfSalesHandler);
router.get("/sales/:id", getSaleByIdHandler);
router.post("/sales", createSaleHandler);
router.patch("/sales/:id", updateSaleHandler);
router.patch("/sales/:id/close", closeSaleHandler);
router.delete("/sales/:id", requireRole(["ADMIN"]), deleteSaleHandler);
// TODO: SEPARAR VENTAS ACTIVAS (cualquiera puede modificar) DE VENTAS INACTIVAS (solo admin))
// router.patch("/sales/:id/deactivate", requireRole(["ADMIN"]), deactivateSaleHandler);

export default router;
