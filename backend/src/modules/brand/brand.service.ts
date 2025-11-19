import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import type { BrandRepository } from "./brand.repo.js";
import type { Brand } from "./brand.entity.js";

type DeactivateStrategy =
  | "clear-products-brand"
  | "cascade-deactivate-products"
  | "cancel";
type ReactivateBrandStrategy = DeactivateStrategy;

export const createBrand = async (
  repo: BrandRepository,
  data: { name: string }
) => {
  const { name } = data;
  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 3, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);

  const duplicate = await repo.findByNormalizedName(normalizedName);
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe una marca activa con este nombre.",
      409,
      "BRAND_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado una marca inactiva con ese nombre.",
      409,
      "BRAND_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }
  const entity = repo.create({
    name: cleanedName,
    normalizedName,
    active: true,
  });
  return await repo.save(entity);
};

export const updateBrand = async (
  repo: BrandRepository,
  updatedData: { id: number; name?: string }
) => {
  const { id, name } = updatedData;
  validateNumberID(id, "Marca");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Marca no encontrada", 404);

  const patch: Partial<Brand> = {};
  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 3, 80, "Nombre");
    const normalizedName = normalizeText(cleanedName);
    const duplicate = await repo.findByNormalizedName(normalizedName);
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una marca activa con este nombre.",
        409,
        "BRAND_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una marca inactiva con este nombre.",
        409,
        "BRAND_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      (patch as any).name = cleanedName;
      (patch as any).normalizedName = normalizedName;
    }
  }
  if (Object.keys(patch).length) {
    await repo.updateFields(id, patch as any);
  }
  return await repo.findById(id);
};

export const deactivateBrand = async (
  repo: BrandRepository,
  id: number,
  strategy?: DeactivateStrategy
) => {
  validateNumberID(id, "Marca");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Marca no encontrada.", 404);

  const count = await repo.countActiveProducts(id);
  if (count > 0 && !strategy) {
    throw new AppError(
      `(Advertencia) La marca que desea eliminar está asociada a ${
        count === 1 ? "un producto" : `${count} productos`
      }.`,
      409,
      "BRAND_IN_USE",
      {
        count,
        allowedStrategies: [
          "clear-products-brand",
          "deactivate-products",
          "cancel",
        ],
      }
    );
  }
  if (count === 0 || strategy === "cancel") {
    if (strategy === "cancel") return existing;
    await repo.softDeactivate(id);
    return await repo.findById(id);
  }
  if (strategy === "clear-products-brand") {
    await repo.clearBrandFromActiveProducts(id);
  }
  if (strategy === "cascade-deactivate-products") {
    await repo.deactivateActiveProducts(id);
  }
  await repo.softDeactivate(id);
  return await repo.findById(id);
};

export const reactivateBrand = async (repo: BrandRepository, id: number) => {
  validateNumberID(id, "Marca");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Marca no encontrada.", 404);
  if ((existing as any).active) {
    throw new AppError(
      "(Error) La marca ya está activa.",
      409,
      "BRAND_ALREADY_ACTIVE",
      { existingId: (existing as any).id }
    );
  }
  await repo.reactivate(id);
  return await repo.findById(id);
};

export const reactivateBrandSwap = async (
  repo: BrandRepository,
  data: {
    inactiveId: number;
    currentId: number;
    strategy?: ReactivateBrandStrategy;
  }
) => {
  const { inactiveId, currentId, strategy } = data;
  if (inactiveId === currentId) {
    throw new AppError(
      "(Error) La marca a reactivar no puede ser igual a la marca actual",
      400
    );
  }
  validateNumberID(currentId, "Marca actual");
  const currentExisting = await repo.findActiveById(currentId);
  if (!currentExisting) throw new AppError("(Error) Marca no encontrada.", 404);

  validateNumberID(inactiveId, "Marca inactiva");
  const inactiveExisting = await repo.findById(inactiveId);
  if (!inactiveExisting)
    throw new AppError("(Error) Marca no encontrada.", 404);
  if ((inactiveExisting as any).active) {
    throw new AppError(
      "(Error) La marca ya está activa.",
      409,
      "BRAND_ALREADY_ACTIVE",
      { inactiveExistingId: (inactiveExisting as any).id }
    );
  }

  const count = await repo.countActiveProducts(currentId);
  if (count > 0 && !strategy) {
    throw new AppError(
      "(Advertencia) La marca actual tiene productos asociados.",
      409,
      "BRAND_IN_USE",
      {
        count,
        allowedStrategies: [
          "clear-products-brand",
          "cascade-deactivate-products",
          "cancel",
        ],
      }
    );
  }
  if (count > 0 && strategy === "cancel") {
    return currentExisting;
  }
  if (count > 0 && strategy === "clear-products-brand") {
    await repo.clearBrandFromActiveProducts(currentId);
  }
  if (count > 0 && strategy === "cascade-deactivate-products") {
    await repo.deactivateActiveProducts(currentId);
  }

  await repo.reactivate(inactiveId);
  await repo.updateFields(currentId, { active: false } as any);
  return await repo.findById(inactiveId);
};

export const getAllBrands = async (
  repo: BrandRepository,
  includeInactive: boolean
) => {
  return await repo.getAll(includeInactive);
};

export const getBrandById = async (repo: BrandRepository, id: number) => {
  validateNumberID(id, "Marca");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Marca no encontrada", 404);
  return existing;
};
