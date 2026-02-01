import type { ProductRepository } from "./product.repo.js";
import { Product } from "./product.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import {
  validateNumberID,
  validatePositiveInteger,
  validatePositiveNumber,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import type { Provider } from "../provider/provider.entity.js";
import type { Category } from "../category/category.entity.js";
import type { Brand } from "../brand/brand.entity.js";
import { getProviderById } from "../provider/provider.service.js";
import { getCategoryById } from "../category/category.service.js";
import { getBrandById } from "../brand/brand.service.js";
import { makeProductRepository } from "./product.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makeBrandRepository } from "../brand/brand.repo.typeorm.js";
import { makeCategoryRepository } from "../category/category.repo.typeorm.js";
import { makeProviderRepository } from "../provider/provider.repo.typeorm.js";

// const productRepo = makeProductRepository(AppDataSource);
const brandRepo = makeBrandRepository(AppDataSource);
const categoryRepo = makeCategoryRepository(AppDataSource);
const providerRepo = makeProviderRepository(AppDataSource);

// SERVICE FOR CREATE A PRODUCT
export const createProduct = async (
  repo: ProductRepository,
  data: {
    name: string;
    code: number;
    price: number;
    idBrand?: number | null;
    idProvider?: number | null;
    idCategory?: number | null;
    stockEnabled: boolean;
    negativeQuantityWarning: boolean;
    minQuantityWarning: boolean;
    quantity?: number | null;
    minQuantity?: number | null;
    imageUrl?: string | null;
    imagePublicId?: string | null;
  }
) => {
  const {
    name,
    code,
    price,
    idBrand,
    idCategory,
    idProvider,
    stockEnabled,
    negativeQuantityWarning,
    minQuantityWarning,
    quantity,
    minQuantity,
    imageUrl,
    imagePublicId,
  } = data;

  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 3, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);
  const duplicateName = await repo.findByNormalizedName(normalizedName);
  if (duplicateName?.active) {
    throw new AppError(
      "(Error) Ya existe un producto activo con este nombre.",
      409,
      "PRODUCT_EXISTS_ACTIVE",
      { existingId: duplicateName.id }
    );
  }

  validateRangeLength(code, 1, 3, "Código");
  validatePositiveInteger(code, "Código");
  const duplicateCode = await repo.findByCode(code);
  if (duplicateCode?.active) {
    throw new AppError(
      "(Error) Ya existe un producto activo con este código.",
      409,
      "PRODUCT_EXISTS_ACTIVE",
      { existingId: duplicateCode.id }
    );
  }

  validatePositiveNumber(price, "Precio");

  let brand: Brand | null = null;
  if (idBrand) {
    validateNumberID(idBrand, "Marca");
    brand = await getBrandById(brandRepo, idBrand);
  }

  let category: Category | null = null;
  if (idCategory) {
    validateNumberID(idCategory, "Categoría");
    category = await getCategoryById(categoryRepo, idCategory);
  }

  let provider: Provider | null = null;
  if (idProvider) {
    validateNumberID(idProvider, "Proveedor");
    provider = await getProviderById(providerRepo, idProvider);
  }

  const stock = Boolean(stockEnabled);
  const negStock = stock ? Boolean(negativeQuantityWarning) : false;
  const minStock = stock ? Boolean(minQuantityWarning) : false;

  let qty: number | null = null;
  let minQty: number | null = null;
  if (stock) {
    if (quantity) {
      validatePositiveInteger(quantity, "Cantidad inicial");
      qty = Number(quantity);
    } else {
      throw new AppError("(Error) Debe agregar una cantidad inicial");
    }
    if (minStock) {
      if (minQuantity) {
        validatePositiveInteger(minQuantity, "Cantidad mínima");
        minQty = Number(minQuantity);
      } else {
        throw new AppError("(Error) Debe agregar una cantidad mínima");
      }
    }
  }

  const entity = repo.create({
    name: cleanedName,
    normalizedName,
    code,
    price,
    stockEnabled: stock,
    minQuantityWarning: minStock,
    negativeQuantityWarning: negStock,
    quantity: qty,
    minQuantity: minQty,
    imageUrl: imageUrl ?? null,
    imagePublicId: imagePublicId ?? null,
    active: true,
  });

  (entity as Product).brand = brand;
  (entity as Product).category = category;
  (entity as Product).provider = provider;

  return await repo.save(entity as Product);
};

// SERVICE FOR UPDATE OR DEACTIVATE A PRODUCT
export const updateProduct = async (
  repo: ProductRepository,
  updatedData: {
    id: number;
    name?: string;
    code?: number;
    price?: number;
    idProvider?: number | null;
    idBrand?: number | null;
    idCategory?: number | null;
    stockEnabled: boolean;
    negativeQuantityWarning: boolean;
    minQuantityWarning: boolean;
    quantity?: number | null;
    minQuantity?: number | null;
    imageUrl?: string | null;
    imagePublicId?: string | null;
  }
) => {
  const {
    id,
    name,
    code,
    price,
    idProvider,
    idCategory,
    idBrand,
    stockEnabled,
    negativeQuantityWarning,
    minQuantityWarning,
    quantity,
    minQuantity,
    imageUrl,
    imagePublicId,
  } = updatedData;
  validateNumberID(id, "Producto");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Producto no encontrado", 404);

  const patch: Partial<Product> = {};

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 3, 80, "Nombre");
    const normalizedName = normalizeText(cleanedName);
    const duplicateName = await repo.findByNormalizedName(normalizedName);
    if (duplicateName && duplicateName.id !== id && duplicateName.active) {
      throw new AppError(
        "(Error) Ya existe un producto activo con este nombre.",
        409,
        "PRODUCT_EXISTS_ACTIVE",
        { existingId: duplicateName.id }
      );
    }
    if (normalizedName !== existing.normalizedName) {
      patch.name = cleanedName;
      patch.normalizedName = normalizedName;
    }
  }

  if (code !== undefined) {
    validateRangeLength(code, 1, 3, "Código");
    validatePositiveInteger(code, "Código");
    const duplicateCode = await repo.findByCode(code);
    if (duplicateCode && duplicateCode.id !== id && duplicateCode.active) {
      throw new AppError(
        "(Error) Ya existe un producto activo con este código.",
        409,
        "PRODUCT_EXISTS_ACTIVE",
        { existingId: duplicateCode.id }
      );
    }
    if (code !== existing.code) patch.code = code;
  }

  if (price !== undefined) {
    validatePositiveNumber(price, "Precio");
    if (price !== existing.price) patch.price = price;
  }

  if (idProvider !== undefined) {
    let provider: Provider | null = null;
    if (idProvider) {
      validateNumberID(idProvider, "Proveedor");
      provider = await getProviderById(providerRepo, idProvider);
    }
    if (provider !== existing.provider) patch.provider = provider;
  }

  if (idCategory !== undefined) {
    let category: Category | null = null;
    if (idCategory) {
      validateNumberID(idCategory, "Categoría");
      category = await getCategoryById(categoryRepo, idCategory);
    }
    if (category !== existing.category) patch.category = category;
  }

  if (idBrand !== undefined) {
    let brand: Brand | null = null;
    if (idBrand) {
      validateNumberID(idBrand, "Marca");
      brand = await getBrandById(brandRepo, idBrand);
    }
    if (brand !== existing.brand) patch.brand = brand;
  }

  const stock = Boolean(stockEnabled);
  const negStock = stock ? Boolean(negativeQuantityWarning) : false;
  const minStock = stock ? Boolean(minQuantityWarning) : false;

  let qty: number | null = null;
  let minQty: number | null = null;
  if (stock) {
    patch.stockEnabled = stock;
    if (quantity) {
      validatePositiveInteger(quantity, "Cantidad inicial");
      qty = Number(quantity);
      patch.quantity = qty;
    } else {
      throw new AppError("(Error) Debe agregar una cantidad inicial");
    }
    if (negStock) patch.negativeQuantityWarning = negStock;
    if (minStock) {
      patch.minQuantityWarning = minStock;
      if (minQuantity) {
        validatePositiveInteger(minQuantity, "Cantidad mínima");
        minQty = Number(minQuantity);
        patch.minQuantity = minQty;
      } else {
        throw new AppError("(Error) Debe agregar una cantidad mínima");
      }
    }
  }

  if (imageUrl !== undefined) {
    patch.imageUrl = imageUrl ?? null;
  }
  if (imagePublicId !== undefined) {
    patch.imagePublicId = imagePublicId ?? null;
  }

  if (Object.keys(patch).length) {
    await repo.updateFields(id, patch);
  }
  return await repo.findById(id);
};

export const incrementProduct = async (
  repo: ProductRepository,
  params: {
    ids: number[];
    percent: number;
  }
) => {
  const { ids, percent } = params;
  for (const id of ids) {
    validateNumberID(id, "Producto");
  }

  validatePositiveInteger(percent, "Porcentaje");

  return await repo.incrementPrices(ids, percent);
};

export const reactivateProduct = async (
  repo: ProductRepository,
  id: number,
  strategy?: "reactivate-product" | "cancel"
) => {
  validateNumberID(id, "Producto");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Producto no encontrado.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El producto ya está activo.",
      409,
      "PRODUCT_ALREADY_ACTIVE",
      { existingId: (existing as Product).id }
    );
  }
  await repo.reactivate(id);
  return await repo.findById(id);
};

export const deactivateProduct = async (
  repo: ProductRepository,
  id: number
) => {
  validateNumberID(id, "Producto");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Producto no encontrado.", 404);

  // Agregar un error para cuando se desea borrar un producto asociado a una venta activa
  await repo.deactivate(id);
};

export const getListOfProducts = async (
  repo: ProductRepository,
  params: {
    includeInactive: boolean;
    filter?: {
      name?: string;
      code?: string;
      minPrice?: number;
      maxPrice?: number;
      idProvider?: number | null;
      idCategory?: number | null;
      idBrand?: number | null;
    };
    sort?: {
      field?:
        | "normalizedName"
        | "code"
        | "price"
        | "provider"
        | "brand"
        | "category"
        | "active";
      direction?: "ASC" | "DESC";
    };
  }
) => {
  const { name, code, minPrice, maxPrice, idProvider, idCategory, idBrand } =
    params.filter ?? {};

  const codeNum = Number(code);
  if (codeNum) {
    validateRangeLength(codeNum, 1, 3, "Código");
    validatePositiveInteger(Number(codeNum), "Código");
  }

  if (minPrice) {
    validatePositiveNumber(minPrice, "Precio mínimo");
  }

  if (maxPrice) {
    validatePositiveNumber(maxPrice, "Precio máximo");
  }

  if (idProvider !== undefined && idProvider !== null) {
    validateNumberID(idProvider, "Proveedor");
    await getProviderById(providerRepo, idProvider);
  }

  if (idCategory !== undefined && idCategory !== null) {
    validateNumberID(idCategory, "Categoría");
    await getCategoryById(categoryRepo, idCategory);
  }

  if (idBrand !== undefined && idBrand !== null) {
    validateNumberID(idBrand, "Marca");
    await getBrandById(brandRepo, idBrand);
  }
  return repo.getListOfProducts(params);
};

// SERVICE FOR GETTING A PRODUCT BY ID
export const getProductById = async (repo: ProductRepository, id: number) => {
  validateNumberID(id, "Producto");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Producto no encontrado", 404);
  return existing;
};
