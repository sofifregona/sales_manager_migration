import { categoryRepo } from "./category.repo.js";
import { Category } from "./category.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import { productRepo } from "../product/product.repo.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

// SERVICE FOR CREATE A BARTABLE
export const createCategory = async (data: { name: string }) => {
  const { name } = data;
  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 5, 80, "Nombre");

  const normalizedName = normalizeText(cleanedName);
  // Validations for repeting brands
  const duplicate = await categoryRepo.findOneBy({ normalizedName });
  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe una categoría activa con este nombre.",
      409,
      "CATEGORY_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado una categoría inactiva con ese nombre.",
      409,
      "CATEGORY_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it doesn't exist, create a new one
  const newCategory = categoryRepo.create({
    name: cleanedName,
    normalizedName,
  });
  return await categoryRepo.save(newCategory);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateCategory = async (updatedData: {
  id: number;
  name?: string;
}) => {
  const { id, name } = updatedData;
  validateNumberID(id, "Categoría");
  const existing = await categoryRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Categoría no encontrada", 404);

  const data: Partial<Category> = {};

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 5, 80, "Nombre");
    const normalizedName = normalizeText(cleanedName);
    // Validations for repeting brands
    const duplicate = await categoryRepo.findOneBy({ normalizedName });

    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una categoría activa con este nombre.",
        409,
        "CATEGORY_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap automático: informamos conflicto reactivable
      throw new AppError(
        "(Error) Ya existe una categoría inactiva con este nombre.",
        409,
        "CATEGORY_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      data.name = cleanedName;
      data.normalizedName = normalizedName;
    }
  }

  await categoryRepo.update(id, data);
  return await categoryRepo.findOneBy({ id });
};

export const reactivateCategory = async (id: number) => {
  validateNumberID(id, "Categoría");
  const existing = await categoryRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Categoría no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) La categoría ya está activa.",
      409,
      "CATEGORY_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await categoryRepo.update(id, { active: true });
  return await categoryRepo.findOneBy({ id });
};

type DeactivateStrategy =
  | "clear-products-category"
  | "deactivate-products"
  | "cancel";

export const softDeleteCategory = async (
  id: number,
  strategy?: DeactivateStrategy
) => {
  validateNumberID(id, "Categoría");

  const existing = await categoryRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Categoría no encontrada.", 404);
  const count = await productRepo.count({
    where: { brand: { id }, active: true },
  });
  if (count > 0 && !strategy) {
    throw new AppError(
      `(Advertencia) La categoría que desea eliminar está asociada a ${
        count === 1
          ? `un producto`
          : `${count} productos.
          Seleccione una opción para continuar:`
      }`,
      409,
      "CATEGORY_IN_USE",
      {
        count,
        allowedStrategies: [
          "clear-products-category",
          "deactivate-products",
          "cancel",
        ],
      }
    );
  }

  if (count === 0 || strategy === "cancel") {
    // Si no hay productos o el usuario canceló, sólo desactivar (o devolver estado actual)
    if (strategy === "cancel") return existing;
    await categoryRepo.update(id, { active: false });
    return await categoryRepo.findOneBy({ id });
  }

  // Hay productos y se definió estrategia: aplicar cambios y desactivar marca en una transacción
  await AppDataSource.transaction(async (tx) => {
    const txProductRepo = tx.getRepository(productRepo.target);
    const txCategoryRepo = tx.getRepository(categoryRepo.target);

    if (strategy === "clear-products-category") {
      await txProductRepo
        .createQueryBuilder()
        .update()
        .set({ category: null })
        .where("categoryId = :id", { id })
        .andWhere("active = :active", { active: true })
        .execute();
    }

    if (strategy === "deactivate-products") {
      await txProductRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("categoryId = :id", { id })
        .andWhere("active = :active", { active: true })
        .execute();
    }

    await txCategoryRepo.update({ id }, { active: false });
  });

  return await categoryRepo.findOneBy({ id });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllCategories = async (
  includeInactive: boolean,
  sort?: { field?: "name" | "active"; direction?: "ASC" | "DESC" }
) => {
  const where = includeInactive ? {} : { active: true };
  const order: Record<string, "ASC" | "DESC"> = {};
  const field =
    sort?.field === "name" ? "normalizedName" : sort?.field ?? "normalizedName";
  const direction = sort?.direction ?? "ASC";
  order[field] = direction;
  return await categoryRepo.find({ where, order });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getCategoryById = async (id: number) => {
  validateNumberID(id, "Categoría");
  const existing = await categoryRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Categoría no encontrada", 404);
  return existing;
};
