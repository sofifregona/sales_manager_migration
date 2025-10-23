﻿import type { PaymentRepository } from "./payment.repo.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makeAccountRepository } from "../account/account.repo.typeorm.js";
import { getAccountById } from "../account/account.service.js";
import type { Payment } from "./payment.entity.js";

const accountRepo = makeAccountRepository(AppDataSource);

export const createPayment = async (
  repo: PaymentRepository,
  data: { name: string; idAccount: number }
) => {
  const { name, idAccount } = data;
  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 8, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);

  const duplicate = await repo.findByNormalizedName(normalizedName);
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe un método de pago activo con este nombre.",
      409,
      "PAYMENT_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado un método de pago inactivo con este nombre.",
      409,
      "PAYMENT_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  validateNumberID(idAccount, "Cuenta");
  const account = await getAccountById(accountRepo, idAccount);

  const entity = repo.create({ name: cleanedName, normalizedName });
  (entity as any).account = account;
  return await repo.save(entity as any);
};

export const updatePayment = async (
  repo: PaymentRepository,
  updatedData: { id: number; name?: string; idAccount?: number }
) => {
  const { id, name, idAccount } = updatedData;
  validateNumberID(id, "Método de pago");

  const existing = await repo.findActiveById(id);
  if (!existing)
    throw new AppError("(Error) Método de pago no encontrado.", 404);

  const patch: Partial<Payment> = {};

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 8, 80, "Nombre");

    const normalizedName = normalizeText(cleanedName);
    const duplicate = await repo.findByNormalizedName(normalizedName);

    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe un método de pago activo con este nombre.",
        409,
        "PAYMENT_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }

    if (duplicate && duplicate.id !== id && !duplicate.active) {
      throw new AppError(
        "(Error) Se ha detectado un método de pago inactivo con este nombre.",
        409,
        "PAYMENT_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      patch.name = cleanedName;
      patch.normalizedName = normalizedName;
    }
  }

  if (idAccount !== undefined) {
    validateNumberID(idAccount, "Cuenta");
    const account = await getAccountById(accountRepo, idAccount);
    if (!account) {
      throw new AppError("(Error) Cuenta no encontrada.", 404);
    }
    patch.account = account;
  }

  if (Object.keys(patch).length) {
    await repo.updateFields(id, patch);
  }
  return await repo.findById(id);
};

export const reactivatePayment = async (
  repo: PaymentRepository,
  id: number,
  strategy?: "reactivate-account" | "cancel"
) => {
  validateNumberID(id, "Método de pago");
  const existing = await repo.findById(id);
  if (!existing)
    throw new AppError("(Error) Método de pago no encontrado.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El método de pago ya está activo.",
      409,
      "PAYMENT_ALREADY_ACTIVE",
      { existingId: (existing as any).id }
    );
  }
  const account: any = (existing as any).account;
  if (account && account.active === false) {
    if (!strategy) {
      throw new AppError(
        "(Advertencia) La cuenta asociada al método de pago está inactiva.",
        409,
        "ACCOUNT_INACTIVE",
        {
          accountId: account.id,
          allowedStrategies: ["reactivate-account", "cancel"],
        }
      );
    }
    if (strategy === "cancel") {
      return existing as any;
    }
    await accountRepo.reactivate(account.id);
  }
  await repo.reactivate(id);
  return await repo.findById(id);
};

export const reactivatePaymentSwap = async (
  repo: PaymentRepository,
  data: { inactiveId: number; currentId: number; strategy?: "reactivate-account" | "cancel" }
) => {
  const { inactiveId, currentId } = data;

  if (currentId === inactiveId) {
    throw new AppError(
      "(Error) Operación inválida: el método de pago actual y el inactivo son el mismo.",
      400
    );
  }

  validateNumberID(currentId, "Método de pago actual");
  const currentExisting = await repo.findActiveById(currentId);
  if (!currentExisting)
    throw new AppError("(Error) Método de pago no encontrado.", 404);

  validateNumberID(inactiveId, "Método de pago inactivo");
  const inactiveExisting = await repo.findById(inactiveId);
  if (!inactiveExisting)
    throw new AppError("(Error) Método de pago no encontrado.", 404);

  if (inactiveExisting.active) {
    throw new AppError(
      "(Error) El método de pago ya está activo.",
      409,
      "PAYMENT_ALREADY_ACTIVE",
      { inactiveExistingId: inactiveExisting.id }
    );
  }

  const account: any = (inactiveExisting as any).account;
  if (account && account.active === false) {
    if (!data.strategy) {
      throw new AppError("(Advertencia) La cuenta asociada al método de pago está inactiva.", 409, "ACCOUNT_INACTIVE", { accountId: account.id, allowedStrategies: ["reactivate-account", "cancel"] });
    }
    if (data.strategy === "cancel") {
      return inactiveExisting as any;
    }
    await accountRepo.reactivate(account.id);
  }

  const patch: Partial<Payment> = {};
  patch.active = false;

  await repo.reactivate(inactiveId);
  const reactivate = repo.findActiveById(inactiveId);
  await repo.updateFields(currentId, patch);
  const deactivate = repo.findActiveById(currentId);
  console.log(reactivate);
  console.log(deactivate);
  return await repo.findActiveById(inactiveId);
};

export const softDeletePayment = async (
  repo: PaymentRepository,
  id: number
) => {
  validateNumberID(id, "Método de pago");
  const existing = await repo.findActiveById(id);
  if (!existing)
    throw new AppError("(Error) Método de pago no encontrado.", 404);
  await repo.updateFields(id, { active: false });
};

export const getAllPayments = async (
  repo: PaymentRepository,
  params: {
    includeInactive: boolean;
    sortField?: "normalizedName" | "active";
    sotDirection: "ASC" | "DESC";
  }
) => {
  return repo.getAll(params);
};

export const getPaymentById = async (
  repo: PaymentRepository,
  id: number
): Promise<Payment> => {
  validateNumberID(id, "Método de pago");
  const payment = await repo.findActiveById(id);
  if (!payment)
    throw new AppError("(Error) Método de pago no encontrado.", 404);
  return payment;
};
