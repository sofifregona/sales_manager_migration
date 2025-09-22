import { Router } from "express";
import {
  createEmployeeHandler,
  getAllEmployeesHandler,
  getEmployeeByIdHandler,
  deactivateEmployeeHandler,
  updateEmployeeHandler,
} from "../controllers/employeeController.js";

const router = Router();

router.post("/employees", createEmployeeHandler);
router.get("/employees", getAllEmployeesHandler);
router.get("/employees/:id", getEmployeeByIdHandler);
router.patch("/employees/:id", updateEmployeeHandler);
router.patch("/employees/:id/deactivate", deactivateEmployeeHandler);

export default router;
