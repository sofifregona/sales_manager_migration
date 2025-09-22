import type { Request, Response } from "express";
import {
  createBartable,
  getAllBartables,
  getBartableById,
  updateBartable,
} from "../services/bartableService.js";
import { AppError } from "../errors/AppError.js";

export const createBartableHandler = async (req: Request, res: Response) => {
  try {
    const bartable = await createBartable(req.body);
    res.status(201).json(bartable);
  } catch (error) {
    console.error("Error al intentar crear la mesa: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
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
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const deactivateBartableHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);

  try {
    const bartable = await updateBartable({ id, active: false });
    res.status(200).json(bartable);
  } catch (error) {
    console.error("Error al intentar dar de baja la mesa: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getAllBartablesHandler = async (_req: Request, res: Response) => {
  try {
    const bartables = await getAllBartables();
    res.status(200).json(bartables);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de mesas: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
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
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};
