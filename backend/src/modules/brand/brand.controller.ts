﻿import type { Request, Response } from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  reactivateBrand,
  softDeleteBrand,
} from "./brand.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

export const createBrandHandler = async (req: Request, res: Response) => {
  try {
    const brand = await createBrand(req.body);
    res.status(201).json(brand);
  } catch (error) {
    console.error("Error al intentar crear la marca: ", error);

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

export const updateBrandHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateBrand({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar la marca: ", error);

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

export const deactivateBrandHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await softDeleteBrand(id, (req.body as any)?.strategy);
    res.status(200).json(brand);
  } catch (error) {
    console.error("Error al intentar eliminar la marca: ", error);

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

export const reactivateBrandHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await reactivateBrand(id);
    res.status(200).json(brand);
  } catch (error) {
    console.error("Error al intentar reactivar la marca: ", error);

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

export const getAllBrandsHandler = async (req: Request, res: Response) => {
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "name" | "active";
    sortDirection: "ASC" | "DESC";
  };

  try {
    const brands = await getAllBrands(
      includeInactive === "1" || includeInactive === "true",
      {
        field: sortField ? sortField : "name",
        direction:
          (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
      }
    );
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de marcas: ", error);

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

export const getBrandByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await getBrandById(id);
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
