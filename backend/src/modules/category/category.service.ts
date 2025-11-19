import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import type { CategoryRepository } from "./category.repo.js";
import type { Category } from "./category.entity.js";

type DeactivateStrategy =
  | "clear-products-category"
  | "cascade-deactivate-products"
  | "cancel";
type ReactivateCategoryStrategy = DeactivateStrategy;

export const createCategory = async (
  repo: CategoryRepository,
  data: { name: string }
) => {
  const { name } = data;
  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 3, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);

  const duplicate = await repo.findByNormalizedName(normalizedName);
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe una categoría activa con este nombre.",
      409,
      "CATEGORY_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado una categoría inactiva con ese nombre.",
      409,
      "CATEGORY_EXISTS_INACTIVE",
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

export const updateCategory = async (
  repo: CategoryRepository,
  updatedData: { id: number; name?: string }
) => {
  const { id, name } = updatedData;
  validateNumberID(id, "Categoría");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Categoría no encontrada", 404);

  const patch: Partial<Category> = {};
  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 3, 80, "Nombre");
    const normalizedName = normalizeText(cleanedName);
    const duplicate = await repo.findByNormalizedName(normalizedName);
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una categoría activa con este nombre.",
        409,
        "CATEGORY_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una categoría inactiva con este nombre.",
        409,
        "CATEGORY_EXISTS_INACTIVE",
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

export const reactivateCategory = async (
  repo: CategoryRepository,
  id: number
) => {
  validateNumberID(id, "Categoría");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Categoría no encontrada.", 404);
  if ((existing as any).active) {
    throw new AppError(
      "(Error) La categoría ya está activa.",
      409,
      "CATEGORY_ALREADY_ACTIVE",
      { existingId: (existing as any).id }
    );
  }
  await repo.reactivate(id);
  return await repo.findById(id);
};

export const softDeleteCategory = async (
  repo: CategoryRepository,
  id: number,
  strategy?: DeactivateStrategy
) => {
  validateNumberID(id, "Categoría");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Categoría no encontrada.", 404);

  const count = await repo.countActiveProducts(id);
  if (count > 0 && !strategy) {
    throw new AppError(
      `(Advertencia) La categoría que desea eliminar está asociada a ${
        count === 1 ? "un producto" : `${count} productos`
      }.`,
      409,
      "CATEGORY_IN_USE",
      {
        count,
        allowedStrategies: [
          "clear-products-category",
          "cascade-deactivate-products",
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
  if (strategy === "clear-products-category") {
    await repo.clearCategoryFromActiveProducts(id);
  }
  if (strategy === "cascade-deactivate-products") {
    await repo.deactivateActiveProducts(id);
  }
  await repo.softDeactivate(id);
  return await repo.findById(id);
};

export const getAllCategories = (
  repo: CategoryRepository,
  includeInactive: boolean = false
) => {
  return repo.getAll(includeInactive);
};

export const getCategoryById = async (repo: CategoryRepository, id: number) => {
  validateNumberID(id, "Categoría");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Categoría no encontrada", 404);
  return existing;
};

export const reactivateCategorySwap = async (
  repo: CategoryRepository,
  data: {
    inactiveId: number;
    currentId: number;
    strategy?: ReactivateCategoryStrategy;
  }
) => {
  const { inactiveId, currentId, strategy } = data;
  if (inactiveId === currentId) {
    throw new AppError(
      "(Error) La categoría a reactivar no puede ser igual a la categoría actual",
      400
    );
  }
  validateNumberID(currentId, "Categoría actual");
  const currentExisting = await repo.findActiveById(currentId);
  if (!currentExisting)
    throw new AppError("(Error) Categoría no encontrada.", 404);

  validateNumberID(inactiveId, "Categoría inactiva");
  const inactiveExisting = await repo.findById(inactiveId);
  if (!inactiveExisting)
    throw new AppError("(Error) Categoría no encontrada.", 404);
  if ((inactiveExisting as any).active) {
    throw new AppError(
      "(Error) La categoría ya está activa.",
      409,
      "CATEGORY_ALREADY_ACTIVE",
      { inactiveExistingId: (inactiveExisting as any).id }
    );
  }

  const count = await repo.countActiveProducts(currentId);
  if (count > 0 && !strategy) {
    throw new AppError(
      "(Advertencia) La categoría actual tiene productos asociados.",
      409,
      "CATEGORY_IN_USE",
      {
        count,
        allowedStrategies: [
          "clear-products-category",
          "cascade-deactivate-products",
          "cancel",
        ],
      }
    );
  }
  if (count > 0 && strategy === "cancel") {
    return currentExisting;
  }
  if (count > 0 && strategy === "clear-products-category") {
    await repo.clearCategoryFromActiveProducts(currentId);
  }
  if (count > 0 && strategy === "cascade-deactivate-products") {
    await repo.deactivateActiveProducts(currentId);
  }

  await repo.reactivate(inactiveId);
  await repo.updateFields(currentId, { active: false } as any);
  return await repo.findById(inactiveId);
};

