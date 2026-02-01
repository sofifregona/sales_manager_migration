import { Account } from "./account.entity.js";
import { AppError } from "../../shared/errors/AppError.js";
import { normalizeText } from "../../shared/utils/helpers/normalizeText.js";
import {
  validateNumberID,
  validateRangeLength,
} from "../../shared/utils/validations/validationHelpers.js";
import type { AccountRepository } from "./account.repo.js";
import type { PaymentMethodRepository } from "../paymentMethod/payment-method.repo.js";

// SERVICE FOR CREATE A BARTABLE
export const createAccount = async (
  repo: AccountRepository,
  data: {
    name: string;
    description: string | null;
  },
) => {
  const { name, description } = data;

  const cleanedName = name.replace(/\s+/g, " ").trim();
  const cleanedDescription = description?.replace(/\s+/g, " ").trim() ?? null;

  validateRangeLength(cleanedName, 5, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);

  const duplicate = await repo.findByNormalizedName(normalizedName);

  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe una cuenta activa con este nombre.",
      409,
    );
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado una cuenta inactiva con ese nombre.",
      409,
      "ACCOUNT_EXISTS_INACTIVE",
      { existingId: duplicate.id },
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
  },
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
      );
    }

    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap autom�tico: informamos conflicto reactivable
      throw new AppError(
        "(Error) Ya existe una cuenta inactiva con este nombre.",
        409,
        "ACCOUNT_EXISTS_INACTIVE",
        { existingId: duplicate.id },
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
  id: number,
) => {
  validateNumberID(id, "Cuenta");

  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  if (existing.active) {
    throw new AppError("(Error) La cuenta ya está activa.", 409);
  }
  await repo.reactivate(id);
  return await repo.findActiveById(id);
};

type DeactivateStrategy = "cascade-delete-payment-methods" | "cancel";

export const reactivateSwapAccount = async (
  repo: AccountRepository,
  data: {
    currentId: number;
    inactiveId: number;
    strategy?: DeactivateStrategy;
  },
  paymentMethodRepo?: PaymentMethodRepository,
) => {
  const { currentId, inactiveId, strategy } = data;

  if (currentId === inactiveId) {
    throw new AppError(
      "(Error) La cuenta a reactivar no puede ser igual a la cuenta actual",
      400,
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
    throw new AppError("(Error) La cuenta ya está activa.", 409);
  }

  // Si la cuenta actual tiene métodos de pago activos, exigir estrategia
  if (paymentMethodRepo) {
    const count = await paymentMethodRepo.countActiveByAccount(currentId);
    if (count > 0 && !strategy) {
      throw new AppError(
        "(Advertencia) La cuenta actual tiene métodos de pago asociados.",
        409,
        "ACCOUNT_IN_USE",
        {
          count,
          allowedStrategies: ["cascade-delete-payment-methods", "cancel"],
        },
      );
    }
    if (count > 0 && strategy === "cancel") {
      return currentExisting;
    }
    if (count > 0 && strategy === "cascade-delete-payment-methods") {
      await paymentMethodRepo.deactivateActiveByAccount(currentId);
    }
  }

  const patch: Partial<Account> = { active: false };
  await repo.reactivate(inactiveId);
  await repo.updateFields(currentId, patch);
  return await repo.findActiveById(inactiveId);
};

export const softDeleteAccount = async (
  repo: AccountRepository,
  paymentMethodRepo: PaymentMethodRepository,
  id: number,
  strategy?: DeactivateStrategy,
) => {
  validateNumberID(id, "Cuenta");

  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  if (existing.isSystem) {
    throw new AppError(
      "(Error) No se puede eliminar una cuenta del sistema.",
      409,
    );
  }

  const count = await paymentMethodRepo.countActiveByAccount(id);

  if (count > 0 && !strategy) {
    throw new AppError(
      `(Advertencia) La cuenta que desea eliminar está asociada a ${
        count === 1
          ? `un método de pago.\nSi continúa, también se eliminará el método de pago asociado.`
          : `${count} métodos de pago.\nSi continúa, también se eliminarán los métodos de pago asociados.`
      }`,
      409,
      "ACCOUNT_IN_USE",
      {
        count,
        allowedStrategies: ["cascade-delete-payment-methods", "cancel"],
      },
    );
  }

  if (count === 0 || strategy === "cancel") {
    if (strategy === "cancel") return existing;
    await repo.softDeactivate(id);
    return;
  }

  await paymentMethodRepo.deactivateActiveByAccount(id);
  await repo.softDeactivate(id);
  return;
};

export const getAllAccounts = (
  repo: AccountRepository,
  includeInactive: boolean = false,
) => {
  return repo.getAll(includeInactive);
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getAccountById = async (
  repo: AccountRepository,
  id: number,
): Promise<Account> => {
  validateNumberID(id, "Cuenta");
  const account = await repo.findById(id);
  if (!account || !account.active)
    throw new AppError("(Error) Cuenta no encontrada.", 404);
  return account;
};
