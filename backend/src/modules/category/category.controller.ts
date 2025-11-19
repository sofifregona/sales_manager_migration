﻿import type { NextFunction, Request, Response } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  reactivateCategory,
  reactivateCategorySwap,
  softDeleteCategory,
} from "./category.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import { makeCategoryRepository } from "./category.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { parse } from "path";

const categoryRepo = makeCategoryRepository(AppDataSource);
// const productRepo = makeProductRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createCategory(categoryRepo, {
      name: req.body.name,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);

  try {
    const updated = await updateCategory(categoryRepo, {
      id,
      name: req.body.name,
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  const strategy = (req.body?.strategy ?? undefined) as
    | "cascade-deactivate-products"
    | "clear-products-category"
    | "cancel"
    | undefined;
  try {
    const deactivated = await softDeleteCategory(categoryRepo, id, strategy);
    res.status(200).json(deactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivateCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const category = await reactivateCategory(categoryRepo, id);
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

export const reactivateSwapCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentId = parseInt((req.body as any)?.currentId, 10);
  const inactiveId = parseInt(req.params.inactiveId, 10);
  const strategy = (req.body as any)?.strategy as
    | "clear-products-category"
    | "cascade-deactivate-products"
    | "cancel"
    | undefined;
  try {
    const swapped = await reactivateCategorySwap(categoryRepo, {
      inactiveId,
      currentId,
      strategy,
    });
    res.status(200).json(swapped);
  } catch (error) {
    next(error);
  }
};

export const getAllCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includeInactive = ["1", "true"].includes(String(req.query.includeInactive));
    const categories = await getAllCategories(categoryRepo, includeInactive);
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const category = await getCategoryById(categoryRepo, id);
    res.status(200).json(category);
  } catch (error) {
    console.error("Error al intentar acceder a la marca: ", error);

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
