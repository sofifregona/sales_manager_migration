import { Router } from "express";
import {
  createProductHandler,
  getListOfProductsHandler,
  getProductByIdHandler,
  deactivateProductHandler,
  updateProductHandler,
  incrementProductHandler,
} from "../controllers/productController.js";

const router = Router();

router.patch("/products/increment", incrementProductHandler);
router.post("/products", createProductHandler);
router.get("/products", getListOfProductsHandler);

router.get("/products/:id", getProductByIdHandler);
router.patch("/products/:id", updateProductHandler);
router.patch("/products/:id/deactivate", deactivateProductHandler);

export default router;
