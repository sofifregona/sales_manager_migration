import type { NextFunction, Request, Response } from "express";
import {
  createProduct,
  getListOfProducts,
  getProductById,
  updateProduct,
  incrementProduct,
  reactivateProduct,
  deactivateProduct,
} from "./product.service.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makeProductRepository } from "./product.repo.typeorm.js";
import {
  buildProductPayload,
  cleanupUploadedFile,
  type MulterRequest,
} from "./product.controller.helpers.js";

const productRepo = makeProductRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = await buildProductPayload(req);
    const product = await createProduct(productRepo, payload);
    res.status(201).json(product);
  } catch (error) {
    await cleanupUploadedFile((req as MulterRequest).file);
    next(error);
  }
};

export const updateProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const payload = await buildProductPayload(req);
    console.log("EN EL UPDATE");
    console.log(payload);
    const updated = await updateProduct(productRepo, { id, ...payload });
    res.status(200).json(updated);
  } catch (error) {
    await cleanupUploadedFile((req as MulterRequest).file);
    next(error);
  }
};

export const incrementProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incremented = await incrementProduct(productRepo, req.body);
    res.status(200).json(incremented);
  } catch (error) {
    next(error);
  }
};

export const deactivateProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);

  try {
    const deactivate = await deactivateProduct(productRepo, id);
    res.status(200).json(deactivate);
  } catch (error) {
    next(error);
  }
};

export const reactivateProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await reactivateProduct(productRepo, id);
    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
};

export const getListOfProductsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      "normalizedName",
      "code",
      "price",
      "provider",
      "brand",
      "category",
      "active",
    ]);
    const field = (allowed.has(fieldRaw) ? fieldRaw : "normalizedName") as
      | "normalizedName"
      | "code"
      | "price"
      | "provider"
      | "brand"
      | "category"
      | "active";

    const direction: "ASC" | "DESC" =
      sortDirection?.toString().toUpperCase() === "DESC" ? "DESC" : "ASC";

    const products = await getListOfProducts(productRepo, {
      includeInactive: includeInactiveBool,
      filter: {
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
      sort: {
        field,
        direction,
      },
    });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const product = await getProductById(productRepo, id);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};
