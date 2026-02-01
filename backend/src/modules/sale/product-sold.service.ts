import type { ProductSoldRepository } from "./product-sold.repo.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validatePositiveInteger,
  validatePositiveNumber,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { getAccountById } from "../account/account.service.js";
import type { ProductSold } from "./product-sold.entity.js";
import { makeSaleRepository } from "./sale.repo.typeorm.js";
import { makeProductRepository } from "../product/product.repo.typeorm.js";
import { getProductById } from "../product/product.service.js";
import { getSaleById } from "./sale.service.js";
import type { Product } from "../product/product.entity.js";
import type { Sale } from "./sale.entity.js";

const saleRepo = makeSaleRepository(AppDataSource);
const productRepo = makeProductRepository(AppDataSource);

export const createProductSold = async (
  repo: ProductSoldRepository,
  data: {
    product: Product;
    subtotal: number;
    sale: Sale;
  }
) => {
  const { product, subtotal, sale } = data;
  validatePositiveNumber(subtotal, "Subtotal");

  const entity = repo.create({ product, quantity: 1, subtotal, sale });
  return await repo.save(entity);
};

export const updateProductSold = async (
  repo: ProductSoldRepository,
  updatedData: {
    id: number;
    subtotal: number;
    quantity: number;
  }
) => {
  const { id, subtotal, quantity } = updatedData;
  const existing = await repo.findById(id);
  if (!existing)
    throw new AppError("(Error) Producto vendido no encontrado", 404);
  validateNumberID(id, "Producto vendido");

  const patch: Partial<ProductSold> = {};

  validatePositiveNumber(subtotal, "Subtotal");
  patch.subtotal = subtotal;
  validatePositiveInteger(quantity, "Cantidad");
  patch.quantity = quantity;

  return await repo.updateFields(id, patch);
};

export const deleteProductSold = async (
  repo: ProductSoldRepository,
  id: number
) => {
  validateNumberID(id, "Producto vendido");
  const existing = await repo.findById(id);
  if (!existing)
    throw new AppError("(Error) Producto vendido no encontrado", 404);
  await repo.delete(id);
};

export const getProductSoldById = async (
  repo: ProductSoldRepository,
  id: number
): Promise<ProductSold> => {
  validateNumberID(id, "Producto vendido");
  const productSold = await repo.findById(id);
  if (!productSold)
    throw new AppError("(Error) Producto vendido no encontrado.", 404);
  return productSold;
};
