import { Router } from "express";
import { loginHandler, logoutHandler, meHandler } from "./auth.controller.js";

const router = Router();

router.post("/auth/login", loginHandler);
router.post("/auth/logout", logoutHandler);
router.get("/auth/me", meHandler);

export default router;
