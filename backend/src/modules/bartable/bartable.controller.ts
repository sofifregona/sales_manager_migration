import type { NextFunction, Request, Response } from "express";
import {
  createBartable,
  getAllBartables,
  getBartableById,
  updateBartable,
  reactivateBartable,
  deactivateBartable,
  reactivateBartableSwap,
} from "./bartable.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import { makeBartableRepository } from "./bartable.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

const bartableRepo = makeBartableRepository(AppDataSource);
// const productRepo = makeProductRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createBartableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createBartable(bartableRepo, {
      number: req.body.number,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateBartableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateBartable(bartableRepo, {
      id,
      number: req.body.number,
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateBartableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  console.log("DENTRO DEL CONTROLLER");
  console.log(id);
  try {
    const deactivated = await deactivateBartable(bartableRepo, id);
    res.status(200).json(deactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivateBartableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const account = await reactivateBartable(bartableRepo, id);
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};

export const reactivateBartableSwapHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentId = parseInt((req.body as any)?.currentId, 10);
  const inactiveId = parseInt((req.body as any)?.inactiveId, 10);
  try {
    const swapped = await reactivateBartableSwap(bartableRepo, {
      inactiveId,
      currentId,
    });
    res.status(200).json(swapped);
  } catch (error) {
    next(error);
  }
};

export const getAllBartablesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includeInactive = ["1", "true"].includes(
      String(req.query.includeInactive)
    );
    const bartables = await getAllBartables(bartableRepo, includeInactive);
    res.status(200).json(bartables);
  } catch (error) {
    next(error);
  }
};

export const getBartableByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const bartable = await getBartableById(bartableRepo, id);
    res.status(200).json(bartable);
  } catch (error) {
    next(error);
  }
};
