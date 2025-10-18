import type { Request, Response } from "express";
import {
  createProduct,
  getListOfProducts,
  getProductById,
  updateProduct,
  incrementProduct,
  reactivateProduct,
} from "./product.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error al intentar crear el producto: ", error);

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

export const updateProductHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateProduct({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar el producto: ", error);

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

export const incrementProductHandler = async (req: Request, res: Response) => {
  try {
    const incremented = await incrementProduct(req.body);
    res.status(200).json(incremented);
  } catch (error) {
    console.error(
      "Error al intentar incrementar los precios de los productos: ",
      error
    );

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

export const deactivateProductHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const product = await updateProduct({ id, active: false });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al intentar eliminar el producto: ", error);

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

export const reactivateProductHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await reactivateProduct(id);
    res.status(200).json(brand);
  } catch (error) {
    console.error("Error al intentar reactivar el producto: ", error);

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

export const getListOfProductsHandler = async (req: Request, res: Response) => {
  const {
    includeInactive,
    name,
    code,
    minPrice,
    maxPrice,
    idBrand,
    idCategory,
    idProvider,
    sortField,
    sortDirection,
  } = req.query as Record<string, any>;

  try {
    const includeInactiveBool =
      includeInactive === "1" || includeInactive === "true";

    const fieldRaw = (sortField?.toString() || "name").toLowerCase();
    const allowed = new Set([
      "name",
      "code",
      "price",
      "provider",
      "brand",
      "category",
      "active",
    ]);
    const field = (allowed.has(fieldRaw) ? fieldRaw : "name") as
      | "name"
      | "code"
      | "price"
      | "provider"
      | "brand"
      | "category"
      | "active";

    const direction: "ASC" | "DESC" =
      sortDirection?.toString().toUpperCase() === "DESC" ? "DESC" : "ASC";

    const products = await getListOfProducts(
      includeInactiveBool,
      {
        name: name?.toString(),
        code: code?.toString(),
        minPrice:
          Number.isFinite(Number(minPrice)) && minPrice !== ""
            ? Number(minPrice)
            : undefined,
        maxPrice:
          Number.isFinite(Number(maxPrice)) && maxPrice !== ""
            ? Number(maxPrice)
            : undefined,
        idBrand:
          idBrand === "null" ? null : idBrand ? Number(idBrand) : undefined,
        idCategory:
          idCategory === "null"
            ? null
            : idCategory
            ? Number(idCategory)
            : undefined,
        idProvider:
          idProvider === "null"
            ? null
            : idProvider
            ? Number(idProvider)
            : undefined,
      },
      { field, direction }
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de productos: ", error);

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

export const getProductByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const product = await getProductById(id);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al intentar acceder al proveedor: ", error);

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
