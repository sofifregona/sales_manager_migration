import type { Express, NextFunction, Request, Response } from "express";
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
import { uploadProductImage } from "@back/src/shared/cloudary.js";
import { unlink } from "node:fs/promises";

const productRepo = makeProductRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

type ProductImagePayload = {
  imageUrl: string;
  imagePublicId: string | null;
};

type MulterRequest = Request & {
  file?: Express.Multer.File | undefined;
};

const cleanupUploadedFile = async (file?: Express.Multer.File | null) => {
  if (!file?.path) {
    return;
  }
  try {
    await unlink(file.path);
  } catch {
    // ignore cleanup errors
  }
};

const resolveProductImage = async (
  req: Request
): Promise<ProductImagePayload | null> => {
  const selectedSample =
    typeof req.body?.selectedSampleImage === "string"
      ? req.body.selectedSampleImage.trim()
      : "";
  const file = (req as MulterRequest).file;

  console.log("[product] selectedSampleImage:", selectedSample || "<empty>");
  if (file?.originalname) {
    console.log("[product] upload received file:", file.originalname);
  }

  if (selectedSample) {
    await cleanupUploadedFile(file);
    console.log("[product] using sample image url:", selectedSample);
    return { imageUrl: selectedSample, imagePublicId: null };
  }

  if (file?.path) {
    try {
      const uploadResult = await uploadProductImage(file.path);
      return {
        imageUrl: uploadResult.secure_url ?? uploadResult.url,
        imagePublicId: uploadResult.public_id ?? null,
      };
    } finally {
      await cleanupUploadedFile(file);
    }
  }

  await cleanupUploadedFile(file);
  return null;
};

const buildProductPayload = async (
  req: Request
): Promise<any> => {
  const basePayload: Record<string, any> = { ...req.body };
  const imagePayload = await resolveProductImage(req);

  if (imagePayload) {
    basePayload.imageUrl = imagePayload.imageUrl;
    basePayload.imagePublicId = imagePayload.imagePublicId;
  }

  delete basePayload.selectedSampleImage;

  console.log("[product] payload ready", {
    imageUrl: basePayload.imageUrl ?? null,
    imagePublicId: basePayload.imagePublicId ?? null,
  });

  return basePayload;
};


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

