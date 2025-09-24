import { productRepo } from "../repositories/productRepo.js";
import { Product } from "../entities/Product.js";
import { AppError } from "../errors/AppError.js";
import util from "node:util";

import { normalizeText } from "../utils/helpers/normalizeText.js";
import {
  validateNumberID,
  validatePositiveInteger,
  validatePositiveNumber,
  validateRangeLength,
} from "../utils/validations/validationHelpers.js";
import type { Provider } from "../entities/Provider.js";
import type { Category } from "../entities/Category.js";
import type { Brand } from "../entities/Brand.js";
import {
  IsNull,
  Like,
  type FindOptionsWhere,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  Raw,
  In,
} from "typeorm";
import { getProviderById } from "./providerService.js";
import { getCategoryById } from "./categoryService.js";
import { getBrandById } from "./brandService.js";

// SERVICE FOR CREATE A BARTABLE
export const createProduct = async (data: {
  name: string;
  code: number;
  price: number;
  idBrand?: number | null;
  idProvider?: number | null;
  idCategory?: number | null;
}) => {
  const { name, code, price, idBrand, idCategory, idProvider } = data;

  const normalizedName = normalizeText(name);
  const duplicateName = await productRepo.findOneBy({ normalizedName });
  if (duplicateName?.active) {
    throw new AppError("Ya existe un producto con este nombre", 409);
  }

  validateRangeLength(code, 1, 3, "Código");
  validatePositiveInteger(code);
  const duplicateCode = await productRepo.findOneBy({ code });
  if (duplicateCode?.active) {
    throw new AppError("Ya existe un producto con este código", 409);
  }

  validatePositiveNumber(price);

  let brand: Brand | null = null;
  if (idBrand) {
    validateNumberID(idBrand);
    brand = await getBrandById(idBrand);
  }

  let category: Category | null = null;
  if (idCategory) {
    validateNumberID(idCategory);
    category = await getCategoryById(idCategory);
  }

  let provider: Provider | null = null;
  if (idProvider) {
    validateNumberID(idProvider);
    provider = await getProviderById(idProvider);
  }

  const newProduct = Object.assign(new Product(), {
    name,
    normalizedName,
    code,
    price,
    provider: provider,
    brand: brand,
    category: category,
    active: true,
  });

  return await productRepo.save(newProduct);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateProduct = async (updatedData: {
  id: number;
  name?: string;
  code?: number;
  price?: number;
  idProvider?: number | null;
  idBrand?: number | null;
  idCategory?: number | null;
  active?: boolean;
}) => {
  const { id, name, code, price, idProvider, idCategory, idBrand, active } =
    updatedData;
  validateNumberID(id);
  const existing = await productRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("Producto no encontrado", 404);

  const data: Partial<Product> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    const duplicateName = await productRepo.findOneBy({ normalizedName });
    if (duplicateName && duplicateName.id !== id && duplicateName.active) {
      throw new AppError("Ya existe un producto con este nombre", 409);
    }
    data.name = name;
    data.normalizedName = normalizedName;
  }

  if (code !== undefined) {
    validateRangeLength(code, 1, 3, "Código");
    validatePositiveInteger(code);
    const duplicateCode = await productRepo.findOneBy({ code });
    if (duplicateCode && duplicateCode.id !== id && duplicateCode.active) {
      throw new AppError("Ya existe un producto con este código", 409);
    }
    data.code = code;
  }

  if (price !== undefined) {
    validatePositiveNumber(price);
    data.price = price;
  }

  if (idProvider !== undefined) {
    let provider: Provider | null = null;
    if (idProvider) {
      validateNumberID(idProvider);
      provider = await getProviderById(idProvider);
    }
    data.provider = provider;
  }

  if (idCategory !== undefined) {
    let category: Category | null = null;
    if (idCategory) {
      validateNumberID(idCategory);
      category = await getCategoryById(idCategory);
    }
    data.category = category;
  }

  if (idBrand !== undefined) {
    let brand: Brand | null = null;
    if (idBrand) {
      validateNumberID(idBrand);
      brand = await getBrandById(idBrand);
    }
    data.brand = brand;
  }

  if (active !== undefined) {
    data.active = active;
  }
  await productRepo.update(id, data);
  return await productRepo.findOneBy({ id });
};

export const incrementProduct = async (params: {
  ids: number[];
  percent: number;
}) => {
  const { ids, percent } = params;
  console.log(ids);

  for (const id of ids) {
    console.log(id);
    validateNumberID(id);
  }

  validatePositiveInteger(percent);
  console.log("PERCENT");
  console.log(percent);

  return await productRepo
    .createQueryBuilder()
    .update(Product)
    .set({ price: () => "ROUND(price * (1 + :p/100), 2)" })
    .where({ id: In(ids), active: true })
    .setParameters({ p: percent })
    .execute();
};

// SERVICE FOR GETTING ALL BARTABLES
export const getListOfProducts = async (params: {
  name?: string;
  code?: string;
  minPrice?: number;
  maxPrice?: number;
  idProvider?: number | null;
  idCategory?: number | null;
  idBrand?: number | null;
  sortField: string;
  sortDirection: string;
}) => {
  const {
    name,
    code,
    minPrice,
    maxPrice,
    idProvider,
    idCategory,
    idBrand,
    sortField,
    sortDirection,
  } = params;

  const codeNum = Number(code);
  if (codeNum) {
    validateRangeLength(codeNum, 1, 3, "Código");
    validatePositiveInteger(Number(codeNum));
  }

  if (minPrice) {
    validatePositiveNumber(minPrice);
  }

  if (maxPrice) {
    validatePositiveNumber(maxPrice);
  }

  if (idProvider !== undefined && idProvider !== null) {
    validateNumberID(idProvider);
    await getProviderById(idProvider);
  }

  if (idCategory !== undefined && idCategory !== null) {
    validateNumberID(idCategory);
    await getCategoryById(idCategory);
  }

  if (idBrand !== undefined && idBrand !== null) {
    validateNumberID(idBrand);
    await getBrandById(idBrand);
  }

  const where: FindOptionsWhere<Product> = {
    active: true,
    ...(idProvider === null
      ? { provider: IsNull() }
      : idProvider != null
      ? { provider: { id: idProvider } }
      : {}),
    ...(idCategory === null
      ? { category: IsNull() }
      : idCategory != null
      ? { category: { id: idCategory } }
      : {}),
    ...(idBrand === null
      ? { brand: IsNull() }
      : idBrand != null
      ? { brand: { id: idBrand } }
      : {}),
    ...(name?.trim() && {
      normalizedName: Like(`${normalizeText(name.trim())}%`),
    }),
    ...(code?.trim()
      ? (() => {
          const prefix = code.replace(/\D/g, ""); // 01
          const w = Math.max(3, prefix.length);
          if (!prefix) return {};
          return {
            code: Raw(
              (col) => `
              LPAD(
                CAST(${col} AS CHAR),
                GREATEST(CHAR_LENGTH(CAST(${col} AS CHAR)), :w), '0') 
                REGEXP CONCAT('^0*', :prefix)`,
              { w, prefix }
            ),
          };
        })()
      : {}),
    ...(minPrice != null && maxPrice != null
      ? { price: Between(minPrice, maxPrice) }
      : minPrice != null
      ? { price: MoreThanOrEqual(minPrice) }
      : maxPrice != null
      ? { price: LessThanOrEqual(maxPrice) }
      : {}),
  };

  return await productRepo.find({
    where,
    relations: { provider: true, brand: true, category: true },
    order: { [sortField]: sortDirection },
  });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getProductById = async (id: number) => {
  validateNumberID(id);
  const existing = await productRepo.findOne({
    where: { id, active: true },
    relations: { provider: true, brand: true, category: true },
  });
  if (!existing) throw new AppError("Producto no encontrado", 404);
  return existing;
};
