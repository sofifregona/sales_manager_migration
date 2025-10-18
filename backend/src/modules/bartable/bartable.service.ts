import { bartableRepo } from "./bartable.repo.js";
import { Bartable } from "./bartable.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validatePositiveInteger,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { saleRepo } from "../sale/sale.repo.js";

// SERVICE FOR CREATE A BARTABLE
export const createBartable = async (data: { number: number }) => {
  const { number } = data;

  validatePositiveInteger(number, "Número");

  // Validations for repeting bartables
  const duplicate = await bartableRepo.findOneBy({ number });

  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe una mesa activa con este número.",
      409,
      "BARTABLE_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado una mesa inactiva con ese número.",
      409,
      "BARTABLE_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it doesn't exist, create a new one
  const newBartable = new Bartable();
  newBartable.number = number;
  newBartable.active = true;

  return await bartableRepo.save(newBartable);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateBartable = async (updatedData: {
  id: number;
  number?: number;
}) => {
  const { id, number } = updatedData;
  validateNumberID(id, "Mesa");

  const existing = await bartableRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Mesa no encontrada", 404);

  const data: Partial<Bartable> = {};

  if (number !== undefined) {
    validatePositiveInteger(number, "Número");

    const duplicate = await bartableRepo.findOneBy({ number });
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una mesa activa con este número.",
        409,
        "BARTABLE_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }

    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap automático: informamos conflicto reactivable
      throw new AppError(
        "(Error) Existe una mesa inactiva con este número.",
        409,
        "BARTABLE_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      data.number = number;
    }
  }

  await bartableRepo.update(id, data);
  return await bartableRepo.findOneBy({ id });
};

export const reactivateAccount = async (id: number) => {
  validateNumberID(id, "Mesa");
  const existing = await bartableRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Mesa no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) La mesa ya está activa.",
      409,
      "BARTABLE_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await bartableRepo.update(id, { active: true });
  return await bartableRepo.findOneBy({ id });
};

export const softDeleteBartable = async (id: number) => {
  validateNumberID(id, "Mesa");

  const existing = await bartableRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Mesa no encontrada.", 404);
  const openSale = await saleRepo.findOneBy({ bartable: { id }, open: true });
  if (openSale) {
    throw new AppError(
      "(Error) No se puede eliminar una mesa que tenga una venta activa.",
      404
    );
  }
  await bartableRepo.update(id, { active: false });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllBartables = async (
  includeInactive: boolean,
  sort?: { field?: "number" | "active"; direction?: "ASC" | "DESC" }
) => {
  const where = includeInactive ? {} : { active: true };
  const order: Record<string, "ASC" | "DESC"> = {};
  const field = sort?.field ?? "number";
  const direction = sort?.direction ?? "ASC";
  order[field] = direction;
  return await bartableRepo.find({ where, order });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getBartableById = async (id: number) => {
  validateNumberID(id, "Mesa");
  const existing = await bartableRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Mesa no encontrada", 404);
  return existing;
};
