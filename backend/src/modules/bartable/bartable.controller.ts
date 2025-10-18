import type { Request, Response } from "express";
import {
  createBartable,
  getAllBartables,
  getBartableById,
  updateBartable,
  reactivateAccount,
  softDeleteBartable,
} from "./bartable.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

export const createBartableHandler = async (req: Request, res: Response) => {
  try {
    const bartable = await createBartable(req.body);
    res.status(201).json(bartable);
  } catch (error) {
    console.error("Error al intentar crear la mesa: ", error);
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

export const updateBartableHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateBartable({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar la mesa: ", error);

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

export const deactivateBartableHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);

  try {
    const bartable = await softDeleteBartable(id);
    res.status(200).json(bartable);
  } catch (error) {
    console.error("Error al intentar eliminar la mesa: ", error);

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

export const reactivateAccountHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const account = await reactivateAccount(id);
    res.status(200).json(account);
  } catch (error) {
    console.error("Error al intentar reactivar la mesa: ", error);

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

export const getAllBartablesHandler = async (req: Request, res: Response) => {
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "number" | "active";
    sortDirection: "ASC" | "DESC";
  };

  try {
    const bartables = await getAllBartables(
      includeInactive === "1" || includeInactive === "true",
      {
        field: sortField ? sortField : "number",
        direction:
          (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
      }
    );
    res.status(200).json(bartables);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de mesas: ", error);

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

export const getBartableByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const bartable = await getBartableById(id);
    res.status(200).json(bartable);
  } catch (error) {
    console.error("Error al intentar acceder a la mesa: ", error);

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
