import type { Request, Response } from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  reactivateEmployee,
  updateEmployee,
} from "./employee.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

export const createEmployeeHandler = async (req: Request, res: Response) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error) {
    console.error("Error al intentar crear el proveedor: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const updateEmployeeHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateEmployee({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar el empleado: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const deactivateEmployeeHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);

  try {
    const employee = await updateEmployee({ id, active: false });
    res.status(200).json(employee);
  } catch (error) {
    console.error("Error al intentar eliminar el empleado: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const reactivateEmployeeHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await reactivateEmployee(id);
    res.status(200).json(brand);
  } catch (error) {
    console.error("Error al intentar reactivar el empleado: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const getAllEmployeesHandler = async (req: Request, res: Response) => {
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "name" | "active";
    sortDirection: "ASC" | "DESC";
  };
  try {
    const employees = await getAllEmployees(
      includeInactive === "1" || includeInactive === "true",
      {
        field: sortField ? sortField : "name",
        direction:
          (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
      }
    );
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de empleados: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const getEmployeeByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const employee = await getEmployeeById(id);
    res.status(200).json(employee);
  } catch (error) {
    console.error("Error al intentar acceder al empleado: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};
