import { Router } from "express";
import { createBrandHandler, getAllBrandsHandler, getBrandByIdHandler, deactivateBrandHandler, updateBrandHandler, } from "../controllers/brandController.js";
const router = Router();
router.post("/brands", createBrandHandler);
router.get("/brands", getAllBrandsHandler);
router.get("/brands/:id", getBrandByIdHandler);
router.patch("/brands/:id", updateBrandHandler);
router.patch("/brands/:id/deactivate", deactivateBrandHandler);
export default router;
