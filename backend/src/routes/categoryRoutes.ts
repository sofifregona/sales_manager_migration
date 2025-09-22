import { Router } from "express";
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  deactivateCategoryHandler,
  updateCategoryHandler,
} from "../controllers/categoryController.js";

const router = Router();

router.post("/categories", createCategoryHandler);
router.get("/categories", getAllCategoriesHandler);
router.get("/categories/:id", getCategoryByIdHandler);
router.patch("/categories/:id", updateCategoryHandler);
router.patch("/categories/:id/deactivate", deactivateCategoryHandler);

export default router;
