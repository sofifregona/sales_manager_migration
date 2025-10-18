import { Router } from "express";
import {
  createEmployeeHandler,
  getAllEmployeesHandler,
  getEmployeeByIdHandler,
  deactivateEmployeeHandler,
  updateEmployeeHandler,
  reactivateEmployeeHandler,
} from "./employee.controller.js";
import { requireRole } from "../../shared/guards/auth.guard.js";

const router = Router();

router.get("/employees", getAllEmployeesHandler);
router.get("/employees/:id", getEmployeeByIdHandler);
router.post(
  "/employees",
  requireRole(["ADMIN", "MANAGER"]),
  createEmployeeHandler
);
router.patch(
  "/employees/:id",
  requireRole(["ADMIN", "MANAGER"]),
  updateEmployeeHandler
);
router.patch(
  "/employees/:id/deactivate",
  requireRole(["ADMIN"]),
  deactivateEmployeeHandler
);
router.patch(
  "/employees/:id/reactivate",
  requireRole(["ADMIN", "MANAGER"]),
  reactivateEmployeeHandler
);

export default router;
