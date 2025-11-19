import type { NextFunction, Request, Response } from "express";
import {
  createEmployee,
  deactivateEmployee,
  getAllEmployees,
  getEmployeeById,
  reactivateEmployee,
  updateEmployee,
} from "./employee.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import { makeEmployeeRepository } from "./employee.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

const employeeRepo = makeEmployeeRepository(AppDataSource);
// const productRepo = makeProductRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createEmployeeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createEmployee(employeeRepo, {
      name: req.body.name,
      dni: req.body.dni,
      email: req.body.email,
      telephone: req.body.telephone,
      address: req.body.address,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);

  try {
    const updated = await updateEmployee(employeeRepo, { id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateEmployeeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);

  try {
    const employee = await deactivateEmployee(employeeRepo, id);
    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

export const reactivateEmployeeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const employee = await reactivateEmployee(employeeRepo, id);
    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

export const getAllEmployeesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includeInactive = ["1", "true"].includes(
      String(req.query.includeInactive)
    );
    const employees = await getAllEmployees(employeeRepo, includeInactive);
    res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const employee = await getEmployeeById(employeeRepo, id);
    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};
