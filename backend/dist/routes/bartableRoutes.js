import { Router } from "express";
import { createBartableHandler, getAllBartablesHandler, getBartableByIdHandler, deactivateBartableHandler, updateBartableHandler, } from "../controllers/bartableController.js";
const router = Router();
router.post("/bartables", createBartableHandler);
router.get("/bartables", getAllBartablesHandler);
router.get("/bartables/:id", getBartableByIdHandler);
router.patch("/bartables/:id", updateBartableHandler);
router.patch("/bartables/:id/deactivate", deactivateBartableHandler);
export default router;
