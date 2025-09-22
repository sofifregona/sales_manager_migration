import { Router } from "express";
import { createProviderHandler, getAllProvidersHandler, getProviderByIdHandler, deactivateProviderHandler, updateProviderHandler, } from "../controllers/providerController.js";
const router = Router();
router.post("/providers", createProviderHandler);
router.get("/providers", getAllProvidersHandler);
router.get("/providers/:id", getProviderByIdHandler);
router.patch("/providers/:id", updateProviderHandler);
router.patch("/providers/:id/deactivate", deactivateProviderHandler);
export default router;
