﻿import type { NextFunction, Request, Response } from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  reactivateBrand,
  reactivateBrandSwap,
  deactivateBrand,
} from "./brand.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import { makeBrandRepository } from "./brand.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { parse } from "path";

const brandRepo = makeBrandRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createBrandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createBrand(brandRepo, {
      name: req.body.name,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateBrandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);

  try {
    const updated = await updateBrand(brandRepo, {
      id,
      name: req.body.name,
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateBrandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  const strategy = (req.body?.strategy ?? undefined) as
    | "cascade-deactivate-products"
    | "clear-products-brand"
    | "cancel"
    | undefined;
  try {
    const deactivated = await deactivateBrand(brandRepo, id, strategy);
    res.status(200).json(deactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivateBrandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const brand = await reactivateBrand(brandRepo, id);
    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
};

export const reactivateSwapBrandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentId = parseInt((req.body as any)?.currentId, 10);
  const inactiveId = parseInt(req.params.inactiveId, 10);
  const strategy = (req.body as any)?.strategy as
    | "clear-products-brand"
    | "cascade-deactivate-products"
    | "cancel"
    | undefined;
  try {
    const swapped = await reactivateBrandSwap(brandRepo, {
      inactiveId,
      currentId,
      strategy,
    });
    res.status(200).json(swapped);
  } catch (error) {
    next(error);
  }
};

export const getAllBrandsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const includeInactive = req.query.includeInactive as string;

  try {
    const brands = await getAllBrands(
      brandRepo,
      includeInactive === "1" || includeInactive === "true"
    );
    res.status(200).json(brands);
  } catch (error) {
    next(error);
  }
};

export const getBrandByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await getBrandById(brandRepo, id);
    res.status(200).json(brand);
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
