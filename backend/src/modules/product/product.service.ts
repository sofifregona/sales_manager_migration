import { productRepo } from "./product.repo.js";
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
import { getProviderById } from "../provider/provider.service.js";
import { getCategoryById } from "../category/category.service.js";
import { getBrandById } from "../brand/brand.service.js";

// SERVICE FOR CREATE A PRODUCT
export const createProduct = async (data: {
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
}) => {
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
  } = data;

  const normalizedName = normalizeText(name);
  const duplicateName = await productRepo.findOneBy({ normalizedName });
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
  const duplicateCode = await productRepo.findOneBy({ code });
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
    brand = await getBrandById(idBrand);
  }

  let category: Category | null = null;
  if (idCategory) {
    validateNumberID(idCategory, "Categoría");
    category = await getCategoryById(idCategory);
  }

  let provider: Provider | null = null;
  if (idProvider) {
    validateNumberID(idProvider, "Proveedor");
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
    stockEnabled,
    minQuantityWarning,
    negativeQuantityWarning,
    quantity: quantity ?? null,
    minQuantity: minQuantity ?? null,
    active: true,
  });

  return await productRepo.save(newProduct);
};

// SERVICE FOR UPDATE OR DEACTIVATE A PRODUCT
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
  validateNumberID(id, "Producto");
  const existing = await productRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Producto no encontrado", 404);

  const data: Partial<Product> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    const duplicateName = await productRepo.findOneBy({ normalizedName });
    if (duplicateName && duplicateName.id !== id && duplicateName.active) {
      throw new AppError(
        "(Error) Ya existe un producto activo con este nombre.",
        409,
        "PRODUCT_EXISTS_ACTIVE",
        { existingId: duplicateName.id }
      );
    }
    data.name = name;
    data.normalizedName = normalizedName;
  }

  if (code !== undefined) {
    validateRangeLength(code, 1, 3, "Código");
    validatePositiveInteger(code, "Código");
    const duplicateCode = await productRepo.findOneBy({ code });
    if (duplicateCode && duplicateCode.id !== id && duplicateCode.active) {
      throw new AppError(
        "(Error) Ya existe un producto activo con este código.",
        409,
        "PRODUCT_EXISTS_ACTIVE",
        { existingId: duplicateCode.id }
      );
    }
    data.code = code;
  }

  if (price !== undefined) {
    validatePositiveNumber(price, "Precio");
    data.price = price;
  }

  if (idProvider !== undefined) {
    let provider: Provider | null = null;
    if (idProvider) {
      validateNumberID(idProvider, "Proveedor");
      provider = await getProviderById(idProvider);
    }
    data.provider = provider;
  }

  if (idCategory !== undefined) {
    let category: Category | null = null;
    if (idCategory) {
      validateNumberID(idCategory, "Categoría");
      category = await getCategoryById(idCategory);
    }
    data.category = category;
  }

  if (idBrand !== undefined) {
    let brand: Brand | null = null;
    if (idBrand) {
      validateNumberID(idBrand, "Marca");
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
  for (const id of ids) {
    validateNumberID(id, "Producto");
  }

  validatePositiveInteger(percent, "Porcentaje");

  return await productRepo
    .createQueryBuilder()
    .update(Product)
    .set({ price: () => "ROUND(price * (1 + :p/100), 2)" })
    .where({ id: In(ids), active: true })
    .setParameters({ p: percent })
    .execute();
};

export const reactivateProduct = async (id: number) => {
  validateNumberID(id, "Producto");
  const existing = await productRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Producto no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El producto ya está activa.",
      409,
      "PRODUCT_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await productRepo.update(id, { active: true });
  return await productRepo.findOneBy({ id });
};

export const softDeleteProduct = async (id: number) => {
  validateNumberID(id, "Producto");

  const existing = await productRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Producto no encontrado.", 404);
  await productRepo.update(id, { active: false });
};

export const getListOfProducts = async (
  includeInactive: boolean,
  filter?: {
    name?: string;
    code?: string;
    minPrice?: number;
    maxPrice?: number;
    idProvider?: number | null;
    idCategory?: number | null;
    idBrand?: number | null;
  },
  sort?: {
    field?:
      | "name"
      | "code"
      | "price"
      | "provider"
      | "brand"
      | "category"
      | "active";
    direction?: "ASC" | "DESC";
  }
) => {
  const { name, code, minPrice, maxPrice, idProvider, idCategory, idBrand } =
    filter ?? {};

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
    await getProviderById(idProvider);
  }

  if (idCategory !== undefined && idCategory !== null) {
    validateNumberID(idCategory, "Categoría");
    await getCategoryById(idCategory);
  }

  if (idBrand !== undefined && idBrand !== null) {
    validateNumberID(idBrand, "Marca");
    await getBrandById(idBrand);

    const where: FindOptionsWhere<Product> = {
      ...(includeInactive ? {} : { active: true }),
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

    const order: Record<string, "ASC" | "DESC"> = {};
    const field = sort?.field ?? "name";
    const direction = sort?.direction ?? "ASC";
    order[field] = direction;

    const sortMap: Record<string, string> = {
      id: "p.id",
      name: "p.normalizedName", // o "p.name" si corresponde
      code: "p.code",
      price: "p.price",
      category: "category.name",
      brand: "brand.name",
      provider: "provider.name",
      active: "p.active",
    };

    const col = sortMap[field] ?? "p.name";

    const qb = await productRepo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.brand", "brand")
      .leftJoinAndSelect("p.category", "category")
      .leftJoinAndSelect("p.provider", "provider")
      // Reutilizá tu filtro ya armado:
      .setFindOptions({
        where,
        // (si querés, podés mantener relations aquí también,
        // pero ya las cubrimos con los leftJoinAndSelect)
      });

    // *** NULOS AL FINAL SIEMPRE ***
    qb.addOrderBy(`${col} IS NULL`, "ASC"); // false(0) primero, true(1) (NULL) último
    qb.addOrderBy(col, direction);

    return qb.getMany();
  }
};

// // SERVICE FOR GETTING ALL PRODUCTS
// export const getListOfProducts = async (params: {
//   name?: string;
//   code?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   idProvider?: number | null;
//   idCategory?: number | null;
//   idBrand?: number | null;
//   sortField: string;
//   sortDirection: string;
// }) => {
//   const {
//     name,
//     code,
//     minPrice,
//     maxPrice,
//     idProvider,
//     idCategory,
//     idBrand,
//     sortField,
//     sortDirection,
//   } = params;

//   const codeNum = Number(code);
//   if (codeNum) {
//     validateRangeLength(codeNum, 1, 3, "Código");
//     validatePositiveInteger(Number(codeNum), "Código");
//   }

//   if (minPrice) {
//     validatePositiveNumber(minPrice, "Precio mínimo");
//   }

//   if (maxPrice) {
//     validatePositiveNumber(maxPrice, "Precio máximo");
//   }

//   if (idProvider !== undefined && idProvider !== null) {
//     validateNumberID(idProvider, "Proveedor");
//     await getProviderById(idProvider);
//   }

//   if (idCategory !== undefined && idCategory !== null) {
//     validateNumberID(idCategory, "Categoría");
//     await getCategoryById(idCategory);
//   }

//   if (idBrand !== undefined && idBrand !== null) {
//     validateNumberID(idBrand, "Marca");
//     await getBrandById(idBrand);
//   }

//   const where: FindOptionsWhere<Product> = {
//     active: true,
//     ...(idProvider === null
//       ? { provider: IsNull() }
//       : idProvider != null
//       ? { provider: { id: idProvider } }
//       : {}),
//     ...(idCategory === null
//       ? { category: IsNull() }
//       : idCategory != null
//       ? { category: { id: idCategory } }
//       : {}),
//     ...(idBrand === null
//       ? { brand: IsNull() }
//       : idBrand != null
//       ? { brand: { id: idBrand } }
//       : {}),
//     ...(name?.trim() && {
//       normalizedName: Like(`${normalizeText(name.trim())}%`),
//     }),
//     ...(code?.trim()
//       ? (() => {
//           const prefix = code.replace(/\D/g, ""); // 01
//           const w = Math.max(3, prefix.length);
//           if (!prefix) return {};
//           return {
//             code: Raw(
//               (col) => `
//               LPAD(
//                 CAST(${col} AS CHAR),
//                 GREATEST(CHAR_LENGTH(CAST(${col} AS CHAR)), :w), '0')
//                 REGEXP CONCAT('^0*', :prefix)`,
//               { w, prefix }
//             ),
//           };
//         })()
//       : {}),
//     ...(minPrice != null && maxPrice != null
//       ? { price: Between(minPrice, maxPrice) }
//       : minPrice != null
//       ? { price: MoreThanOrEqual(minPrice) }
//       : maxPrice != null
//       ? { price: LessThanOrEqual(maxPrice) }
//       : {}),
//   };

//   const dir: "ASC" | "DESC" =
//     sortDirection?.toUpperCase() === "DESC" ? "DESC" : "ASC";

//   const sortMap: Record<string, string> = {
//     brand: "brand.name",
//     category: "category.name",
//     provider: "provider.name",
//     name: "p.normalizedName", // o "p.name" si corresponde
//     code: "p.code",
//     price: "p.price",
//     id: "p.id",
//   };

//   const col = sortMap[sortField] ?? "p.name";

//   const qb = await productRepo
//     .createQueryBuilder("p")
//     .leftJoinAndSelect("p.brand", "brand")
//     .leftJoinAndSelect("p.category", "category")
//     .leftJoinAndSelect("p.provider", "provider")
//     // Reutilizá tu filtro ya armado:
//     .setFindOptions({
//       where,
//       // (si querés, podés mantener relations aquí también,
//       // pero ya las cubrimos con los leftJoinAndSelect)
//     });

//   // *** NULOS AL FINAL SIEMPRE ***
//   qb.addOrderBy(`${col} IS NULL`, "ASC"); // false(0) primero, true(1) (NULL) último
//   qb.addOrderBy(col, dir);

//   return qb.getMany();
// };

// SERVICE FOR GETTING A PRODUCT BY ID
export const getProductById = async (id: number) => {
  validateNumberID(id, "Producto");
  const existing = await productRepo.findOne({
    where: { id, active: true },
    relations: { provider: true, brand: true, category: true },
  });
  if (!existing) throw new AppError("(Error) Producto no encontrado", 404);
  return existing;
};
