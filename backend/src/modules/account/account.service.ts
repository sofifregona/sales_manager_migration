import { accountRepo } from "./account.repo.js";
import { Account } from "./account.entity.js";
import { AppError } from "../../shared/errors/AppError.js";
import { normalizeText } from "../../shared/utils/helpers/normalizeText.js";
import {
  validateNumberID,
  validateRangeLength,
} from "../../shared/utils/validations/validationHelpers.js";
import { paymentRepo } from "../payment/payment.repo.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

// SERVICE FOR CREATE A BARTABLE
export const createAccount = async (data: {
  name: string;
  description: string | null;
}) => {
  const { name, description } = data;

  const cleanedName = name.replace(/\s+/g, " ").trim();
  const cleanedDescription = description?.replace(/\s+/g, " ").trim() ?? null;

  validateRangeLength(cleanedName, 8, 80, "Nombre");

  const normalizedName = normalizeText(cleanedName);
  // Validations for repeting brands
  const duplicate = await accountRepo.findOneBy({ normalizedName });

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
  const newAccount = accountRepo.create({
    name: cleanedName,
    normalizedName,
    description: cleanedDescription ?? null,
  });

  return await accountRepo.save(newAccount);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateAccount = async (updatedData: {
  id: number;
  name?: string;
  description?: string;
}) => {
  const { id, name, description } = updatedData;
  validateNumberID(id, "Cuenta");

  const existing = await accountRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  const data: Partial<Account> = {};

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 8, 80, "Nombre");

    const normalizedName = normalizeText(cleanedName);
    const duplicate = await accountRepo.findOneBy({ normalizedName });

    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe una cuenta activa con este nombre.",
        409,
        "ACCOUNT_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }

    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap automático: informamos conflicto reactivable
      throw new AppError(
        "(Error) Ya existe una cuenta inactiva con este nombre.",
        409,
        "ACCOUNT_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      data.name = cleanedName;
      data.normalizedName = normalizedName;
    }
  }

  if (description !== undefined) {
    const cleanedDescription = description?.replace(/\s+/g, " ").trim() ?? null;
    data.description = cleanedDescription;
  }

  await accountRepo.update(id, data);
  return await accountRepo.findOneBy({ id });
};

export const reactivateAccount = async (id: number) => {
  validateNumberID(id, "Cuenta");
  const existing = await accountRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) La cuenta ya está activa.",
      409,
      "ACCOUNT_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await accountRepo.update(id, { active: true });
  return await accountRepo.findOneBy({ id });
};

type DeactivateStrategy = "cascade-delete-payments" | "cancel";

export const softDeleteAccount = async (
  id: number,
  strategy?: DeactivateStrategy
) => {
  validateNumberID(id, "Cuenta");

  const existing = await accountRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  const count = await paymentRepo.count({
    where: { account: { id }, active: true },
  });

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
        allowedStrategies: ["cascade-delete-payments", "cancel"],
      }
    );
  }

  if (count === 0 || strategy === "cancel") {
    if (strategy === "cancel") return existing;
    await accountRepo.update(id, { active: false });
    return await accountRepo.findOneBy({ id });
  }

  await AppDataSource.transaction(async (tx) => {
    const txPaymentRepo = tx.getRepository(paymentRepo.target);
    const txAccountRepo = tx.getRepository(accountRepo.target);

    if (strategy === "cascade-delete-payments") {
      await txPaymentRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("accountId = :id", { id })
        .andWhere("active = :active", { active: true })
        .execute();
    }

    await txAccountRepo.update({ id }, { active: false });
  });

  return await accountRepo.findOneBy({ id });
};

export const getAllAccounts = async (
  includeInactive: boolean,
  sort?: { field?: "name" | "active"; direction?: "ASC" | "DESC" }
) => {
  const where = includeInactive ? {} : { active: true };
  const order: Record<string, "ASC" | "DESC"> = {};
  const field =
    sort?.field === "name" ? "normalizedName" : sort?.field ?? "normalizedName";
  const direction = sort?.direction ?? "ASC";
  order[field] = direction;
  return await accountRepo.find({ where, order });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getAccountById = async (id: number): Promise<Account> => {
  validateNumberID(id, "Cuenta");
  const existing = await accountRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);
  return existing;
};
