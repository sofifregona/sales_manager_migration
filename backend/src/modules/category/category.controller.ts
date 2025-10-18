﻿import type { Request, Response } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  reactivateCategory,
  softDeleteCategory,
  updateCategory,
} from "./category.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json(category);
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

export const updateCategoryHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateCategory({ id, ...req.body });
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

export const deactivateCategoryHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);

  try {
    const category = await softDeleteCategory(id, (req.body as any)?.strategy);
    res.status(200).json(category);
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

export const reactivateCategoryHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const category = await reactivateCategory(id);
    res.status(200).json(category);
  } catch (error) {
    console.error("Error al intentar reactivar la categoría: ", error);

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

export const getAllCategoriesHandler = async (req: Request, res: Response) => {
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "name" | "active";
    sortDirection: "ASC" | "DESC";
  };
  try {
    const categorys = await getAllCategories(
      includeInactive === "1" || includeInactive === "true",
      {
        field: sortField ? sortField : "name",
        direction:
          (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
      }
    );
    res.status(200).json(categorys);
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

export const getCategoryByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const category = await getCategoryById(id);
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
