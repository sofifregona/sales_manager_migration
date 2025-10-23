import { Account } from "./account.entity.js";
import { AppError } from "../../shared/errors/AppError.js";
import { normalizeText } from "../../shared/utils/helpers/normalizeText.js";
import {
  validateNumberID,
  validateRangeLength,
} from "../../shared/utils/validations/validationHelpers.js";
import type { AccountRepository } from "./account.repo.js";
import type { PaymentRepository } from "../payment/payment.repo.js";

// SERVICE FOR CREATE A BARTABLE
export const createAccount = async (
  repo: AccountRepository,
  data: {
    name: string;
    description: string | null;
  }
) => {
  const { name, description } = data;

  const cleanedName = name.replace(/\s+/g, " ").trim();
  const cleanedDescription = description?.replace(/\s+/g, " ").trim() ?? null;

  validateRangeLength(cleanedName, 8, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);

  const duplicate = await repo.findByNormalizedName(normalizedName);

  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe una cuenta activa con este nombre.",
      409,
      "ACCOUNT_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado una cuenta inactiva con ese nombre.",
      409,
      "ACCOUNT_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it doesn't exist, create a new one
  const newAccount = repo.create({
    name: cleanedName,
    normalizedName,
    description: cleanedDescription ?? null,
  });

  return await repo.save(newAccount);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateAccount = async (
  repo: AccountRepository,
  data: {
    id: number;
    name?: string;
    description?: string;
  }
) => {
  const { id, name, description } = data;
  validateNumberID(id, "Cuenta");

  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  const patch: Partial<Account> = {};

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 8, 80, "Nombre");

    const normalizedName = normalizeText(cleanedName);
    const duplicate = await repo.findByNormalizedName(normalizedName);

    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una cuenta activa con este nombre.",
        409,
        "ACCOUNT_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }

    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap autom�tico: informamos conflicto reactivable
      throw new AppError(
        "(Error) Ya existe una cuenta inactiva con este nombre.",
        409,
        "ACCOUNT_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      patch.name = cleanedName;
      patch.normalizedName = normalizedName;
    }
  }

  if (description !== undefined) {
    const cleanedDescription = description?.replace(/\s+/g, " ").trim() ?? null;
    patch.description = cleanedDescription;
  }

  if (Object.keys(patch).length > 0) {
    await repo.updateFields(id, patch);
  }
  return await repo.findActiveById(id);
};

export const reactivateAccount = async (
  repo: AccountRepository,
  id: number
) => {
  console.log("DENTRO DEL SERVICE DE REACTIVATE");
  validateNumberID(id, "Cuenta");
  const existing = await repo.findById(id);
  console.log(existing);
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  if (existing.active) {
    throw new AppError(
      "(Error) La cuenta ya está activa.",
      409,
      "ACCOUNT_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await repo.reactivate(id);
  return await repo.findActiveById(id);
};

export const reactivateSwapAccount = async (
  repo: AccountRepository,
  data: {
    currentId: number;
    inactiveId: number;
    strategy?: DeactivateStrategy;
  },
  paymentRepo?: PaymentRepository
) => {
  const { currentId, inactiveId, strategy } = data;

  if (currentId === inactiveId) {
    throw new AppError(
      "(Error) La cuenta a reactivar no puede ser igual a la cuenta actual",
      400
    );
  }

  validateNumberID(currentId, "Cuenta actual");
  const currentExisting = await repo.findActiveById(currentId);
  if (!currentExisting)
    throw new AppError("(Error) Cuenta no encontrada.", 404);

  validateNumberID(inactiveId, "Cuenta inactiva");
  const inactiveExisting = await repo.findById(inactiveId);
  if (!inactiveExisting)
    throw new AppError("(Error) Cuenta no encontrada.", 404);

  if (inactiveExisting.active) {
    throw new AppError(
      "(Error) La cuenta ya está activa.",
      409,
      "ACCOUNT_ALREADY_ACTIVE",
      { inactiveExistingId: inactiveExisting.id }
    );
  }

  // Si la cuenta actual tiene métodos de pago activos, exigir estrategia
  if (paymentRepo) {
    const count = await paymentRepo.countActiveByAccount(currentId);
    if (count > 0 && !strategy) {
      throw new AppError(
        "(Advertencia) La cuenta actual tiene métodos de pago asociados.",
        409,
        "ACCOUNT_IN_USE",
        { count, allowedStrategies: ["cascade-delete-payments", "cancel"] }
      );
    }
    if (count > 0 && strategy === "cancel") {
      return currentExisting;
    }
    if (count > 0 && strategy === "cascade-delete-payments") {
      await paymentRepo.deactivateActiveByAccount(currentId);
    }
  }

  const patch: Partial<Account> = { active: false };
  await repo.reactivate(inactiveId);
  await repo.updateFields(currentId, patch);
  return await repo.findActiveById(inactiveId);
};

type DeactivateStrategy = "cascade-delete-payments" | "cancel";

export const softDeleteAccount = async (
  repo: AccountRepository,
  paymentRepo: PaymentRepository,
  id: number,
  strategy?: DeactivateStrategy
) => {
  validateNumberID(id, "Cuenta");

  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  const count = await paymentRepo.countActiveByAccount(id);

  if (count > 0 && !strategy) {
    throw new AppError(
      `(Advertencia) La cuenta que desea eliminar est� asociada a ${
        count === 1
          ? `un m�todo de pago.\nSi contin�a, tambi�n se eliminar� el m�todo de pago asociado.`
          : `${count} m�todos de pago.\nSi contin�a, tambi�n se eliminar�n los m�todos de pago asociados.`
      }`,
      409,
      "ACCOUNT_IN_USE",
      {
        count,
        allowedStrategies: ["cascade-delete-payments", "cancel"],
      }
    );
  }

  if (count === 0 || strategy === "cancel") {
    if (strategy === "cancel") return existing;
    await repo.softDeactivate(id);
    return await repo.findActiveById(id);
  }

  await paymentRepo.deactivateActiveByAccount(id);
  await repo.softDeactivate(id);
  return;
};

export const getAllAccounts = async (
  repo: AccountRepository,
  params: {
    includeInactive: boolean;
    sortField?: "normalizedName" | "active";
    sotDirection: "ASC" | "DESC";
  }
) => {
  return repo.getAll(params);
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getAccountById = async (
  repo: AccountRepository,
  id: number
): Promise<Account> => {
  validateNumberID(id, "Cuenta");
  const account = await repo.findById(id);
  if (!account || !account.active)
    throw new AppError("(Error) Cuenta no encontrada.", 404);
  return account;
};
