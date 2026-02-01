import type { Express, Request } from "express";
import { unlink } from "node:fs/promises";
import { uploadProductImage } from "@back/src/shared/cloudary.js";

type ProductImagePayload = {
  imageUrl: string;
  imagePublicId: string | null;
};

export type MulterRequest = Request & {
  file?: Express.Multer.File | undefined;
};

const BOOLEAN_TRUE_VALUES = new Set(["1", "true", "on"]);

const parseBooleanField = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return BOOLEAN_TRUE_VALUES.has(value.toLowerCase().trim());
  }
  return false;
};

const parseNumberField = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const parseNullableNumberField = (value: unknown): number | null => {
  const parsed = parseNumberField(value);
  return typeof parsed === "number" ? parsed : null;
};

const parseIdField = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "null") {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "number") {
    return value;
  }
  return null;
};

export const cleanupUploadedFile = async (file?: Express.Multer.File | null) => {
  if (!file?.path) {
    return;
  }
  try {
    await unlink(file.path);
  } catch {
    // ignore cleanup errors
  }
};

export const resolveProductImage = async (
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

export const buildProductPayload = async (
  req: Request
): Promise<any> => {
  const body = req.body ?? {};
  const imagePayload = await resolveProductImage(req);
  const basePayload: Record<string, unknown> = {
    name: typeof body.name === "string" ? body.name.trim() : body.name,
    code: parseNumberField(body.code),
    price: parseNumberField(body.price),
    idBrand: parseIdField(body.idBrand),
    idCategory: parseIdField(body.idCategory),
    idProvider: parseIdField(body.idProvider),
    stockEnabled: parseBooleanField(body.stockEnabled),
    quantity: parseNullableNumberField(body.quantity),
    negativeQuantityWarning: parseBooleanField(body.negativeQuantityWarning),
    minQuantityWarning: parseBooleanField(body.minQuantityWarning),
    minQuantity: parseNullableNumberField(body.minQuantity),
  };

  if (imagePayload) {
    basePayload.imageUrl = imagePayload.imageUrl;
    basePayload.imagePublicId = imagePayload.imagePublicId;
  }

  console.log("[product] payload ready", {
    imageUrl: basePayload.imageUrl ?? null,
    imagePublicId: basePayload.imagePublicId ?? null,
  });

  return basePayload;
};
