import { brandRepo } from "./brand.repo.js";
import { Brand } from "./brand.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import { validateNumberID } from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import { productRepo } from "../product/product.repo.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

// SERVICE FOR CREATE A BARTABLE
export const createBrand = async (data: { name: string }) => {
  const { name } = data;

  const normalizedName = normalizeText(name);
  // Validations for repeting brands
  const duplicate = await brandRepo.findOneBy({ normalizedName });

  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe una marca activa con este nombre.",
      409,
      "BRAND_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado una marca inactiva con ese nombre.",
      409,
      "BRAND_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it doesn't exist, create a new one
  const newBrand = new Brand();
  newBrand.name = name;
  newBrand.normalizedName = normalizedName;
  newBrand.active = true;

  return await brandRepo.save(newBrand);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateBrand = async (updatedData: {
  id: number;
  name?: string;
  active?: boolean;
}) => {
  const { id, name, active } = updatedData;
  validateNumberID(id, "Marca");
  const existing = await brandRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Marca no encontrada", 404);

  const data: Partial<Brand> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    // Validations for repeting brands
    const duplicate = await brandRepo.findOneBy({ normalizedName });

    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una marca activa con este nombre.",
        409,
        "BRAND_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap automático: informamos conflicto reactivable
      throw new AppError(
        "(Error) Ya xiste una marca inactiva con este nombre.",
        409,
        "BRAND_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      data.name = name;
      data.normalizedName = normalizedName;
    }
  }

  await brandRepo.update(id, data);
  return await brandRepo.findOneBy({ id });
};

export const reactivateBrand = async (id: number) => {
  validateNumberID(id, "Marca");
  const existing = await brandRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Marca no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) La marca ya está activa.",
      409,
      "BRAND_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await brandRepo.update(id, { active: true });
  return await brandRepo.findOneBy({ id });
};

type DeactivateStrategy =
  | "clear-products-brand"
  | "deactivate-products"
  | "cancel";

export const softDeleteBrand = async (
  id: number,
  strategy?: DeactivateStrategy
) => {
  validateNumberID(id, "Marca");

  const existing = await brandRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Marca no encontrada.", 404);

  const count = await productRepo.count({
    where: { brand: { id }, active: true },
  });
  if (count > 0 && !strategy) {
    throw new AppError(
      `(Advertencia) La marca que desea eliminar está asociada a ${
        count === 1
          ? `un producto`
          : `${count} productos.
        Seleccione una opción para continuar:`
      }`,
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
    // Si no hay productos o el usuario canceló, sólo desactivar (o devolver estado actual)
    if (strategy === "cancel") return existing;
    await brandRepo.update(id, { active: false });
    return await brandRepo.findOneBy({ id });
  }

  // Hay productos y se definió estrategia: aplicar cambios y desactivar marca en una transacción
  await AppDataSource.transaction(async (tx) => {
    const txProductRepo = tx.getRepository(productRepo.target);
    const txBrandRepo = tx.getRepository(brandRepo.target);

    if (strategy === "clear-products-brand") {
      await txProductRepo
        .createQueryBuilder()
        .update()
        .set({ brand: null })
        .where("brandId = :id", { id })
        .andWhere("active = :active", { active: true })
        .execute();
    }

    if (strategy === "deactivate-products") {
      await txProductRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("brandId = :id", { id })
        .andWhere("active = :active", { active: true })
        .execute();
    }

    await txBrandRepo.update({ id }, { active: false });
  });

  return await brandRepo.findOneBy({ id });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllBrands = async (
  includeInactive: boolean,
  sort?: { field?: "name" | "active"; direction?: "ASC" | "DESC" }
) => {
  const where = includeInactive ? {} : { active: true };
  const order: Record<string, "ASC" | "DESC"> = {};
  const field =
    sort?.field === "name" ? "normalizedName" : sort?.field ?? "normalizedName";
  const direction = sort?.direction ?? "ASC";
  order[field] = direction;
  return await brandRepo.find({ where, order });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getBrandById = async (id: number) => {
  validateNumberID(id, "Marca");
  const existing = await brandRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Marca no encontrada", 404);
  return existing;
};
