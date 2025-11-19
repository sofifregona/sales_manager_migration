import { type BartableRepository } from "./bartable.repo.js";
import { Bartable } from "./bartable.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validatePositiveInteger,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { makeSaleRepository } from "../sale/sale.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { getOpenSaleByBartableId } from "../sale/sale.service.js";

const saleRepo = makeSaleRepository(AppDataSource);
// SERVICE FOR CREATE A BARTABLE
export const createBartable = async (
  repo: BartableRepository,
  data: { number: number }
) => {
  const { number } = data;

  validatePositiveInteger(number, "Número");

  // Validations for repeting bartables
  const duplicate = await repo.findByNumber(number);

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
  const entity = repo.create({
    number,
    active: true,
  });
  return await repo.save(entity);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateBartable = async (
  repo: BartableRepository,
  updatedData: {
    id: number;
    number?: number;
  }
) => {
  const { id, number } = updatedData;
  validateNumberID(id, "Mesa");

  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Mesa no encontrada", 404);

  const patch: Partial<Bartable> = {};

  if (number !== undefined) {
    validatePositiveInteger(number, "Número");

    const duplicate = await repo.findByNumber(number);
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
      patch.number = number;
    }
  }

  if (Object.keys(patch).length) {
    await repo.updateFields(id, patch as any);
  }
  return await repo.findById(id);
};

export const deactivateBartable = async (
  repo: BartableRepository,
  id: number
) => {
  validateNumberID(id, "Mesa");

  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Mesa no encontrada.", 404);
  const openSale = await getOpenSaleByBartableId(saleRepo, id);
  if (openSale) {
    throw new AppError(
      "(Error) No se puede eliminar una mesa que tenga una venta activa.",
      404
    );
  }
  await repo.deactivate(id);
};

export const reactivateBartable = async (
  repo: BartableRepository,
  id: number
) => {
  validateNumberID(id, "Mesa");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Mesa no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) La mesa ya está activa.",
      409,
      "BARTABLE_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await repo.reactivate(id);
  return await repo.findById(id);
};

export const reactivateBartableSwap = async (
  repo: BartableRepository,
  data: {
    inactiveId: number;
    currentId: number;
  }
) => {
  const { inactiveId, currentId } = data;
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

  const openSale = await getOpenSaleByBartableId(saleRepo, currentId);
  if (openSale) {
    throw new AppError(
      "(Error) No se puede eliminar una mesa que tenga una venta activa.",
      404
    );
  }

  await repo.reactivate(inactiveId);
  await repo.deactivate(currentId);
  return await repo.findById(inactiveId);
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllBartables = (
  repo: BartableRepository,
  includeInactive: boolean = false
) => {
  return repo.getAll(includeInactive);
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getBartableById = async (repo: BartableRepository, id: number) => {
  validateNumberID(id, "Mesa");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Mesa no encontrada", 404);
  return existing;
};
