import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validatePositiveNumber,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makeAccountRepository } from "../account/account.repo.typeorm.js";
import type { AccountRepository } from "../account/account.repo.js";
import { getOpenSaleById } from "../sale/sale.service.js";
import { makeSaleRepository } from "../sale/sale.repo.typeorm.js";
import type { Sale } from "../sale/sale.entity.js";
import type {
  TransactionRepository,
  TransactionUpdateFields,
} from "./transaction.repo.js";
import { makeTransactionRepository } from "./transaction.repo.typeorm.js";
import { makeUserRepository } from "../user/user.repo.typeorm.js";
import type { UserRepository } from "../user/user.repo.js";
import { getUserById } from "../user/user.service.js";

const accountRepo: AccountRepository = makeAccountRepository(AppDataSource);
const saleRepo = makeSaleRepository(AppDataSource);
const transactionRepo: TransactionRepository =
  makeTransactionRepository(AppDataSource);
const userRepo: UserRepository = makeUserRepository(AppDataSource);

export const createTransaction = async (data: {
  idAccount: number;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  origin: "sale" | "movement";
  idSale: number | null;
  createdById: number;
}) => {
  const {
    idAccount,
    type,
    amount,
    description,
    origin,
    idSale,
    createdById,
  } = data;

  validateNumberID(idAccount, "Cuenta");
  const account = await accountRepo.findById(idAccount);
  if (!account) {
    throw new AppError("(Error) Cuenta no encontrada.", 404);
  }

  if (!["expense", "income"].includes(type)) {
    throw new AppError("(Error) Operación no soportada.", 422);
  }

  if (!["sale", "movement"].includes(origin)) {
    throw new AppError("(Error) Operación de origen desconocido.", 422);
  }

  validatePositiveNumber(amount, "Monto");
  validateNumberID(createdById, "Usuario");
  const createdBy = await getUserById(userRepo, createdById);
  if (!createdBy) {
    throw new AppError("(Error) Usuario no encontrado.", 404);
  }

  let sale: Sale | null = null;
  if (idSale) {
    validateNumberID(idSale, "Venta");
    sale = await getOpenSaleById(saleRepo, idSale);
    if (!sale) {
      throw new AppError("(Error) Venta no encontrada.", 404);
    }
  }

  const newTransaction = transactionRepo.create({
    account,
    type: origin === "sale" ? "income" : type,
    origin,
    amount,
    description: description ?? null,
    sale: idSale ? sale : null,
    createdBy,
  });

  return await transactionRepo.save(newTransaction);
};

export const updateTransaction = async (updatedData: {
  id: number;
  idAccount?: number;
  type?: "expense" | "income";
  amount?: number;
  description?: string;
}) => {
  const { id, idAccount, type, amount, description } = updatedData;
  validateNumberID(id, "Transacción");
  const existing = await transactionRepo.findSimpleById(id);
  if (!existing) throw new AppError("(Error) Transacción no encontrada.", 404);
  if (existing.origin === "sale") {
    throw new AppError(
      `(Error) No se puede modificar una transacción proveniente de las ventas.
      Si desea modificar una venta, vaya a la lista de ventas.`
    );
  }

  const patch: TransactionUpdateFields = {};

  if (idAccount !== undefined) {
    validateNumberID(idAccount, "Cuenta");
    const account = await accountRepo.findById(idAccount);
    if (!account) {
      throw new AppError("(Error) Cuenta no encontrada.", 404);
    }
    patch.account = account;
  }

  if (type !== undefined) {
    if (!["expense", "income"].includes(type)) {
      throw new AppError("(Error) Operación no soportada.", 422);
    }
    patch.type = type;
  }

  if (amount !== undefined) {
    validatePositiveNumber(amount, "Monto");
    patch.amount = amount;
  }

  if (description !== undefined) {
    patch.description = description;
  }

  await transactionRepo.updateFields(id, patch);
  return await transactionRepo.findSimpleById(id);
};

export const deleteTransaction = async (id: number) => {
  validateNumberID(id, "Transacción");

  const existing = await transactionRepo.findSimpleById(id);
  if (!existing) throw new AppError("(Error) Transacción no encontrada.", 404);
  await transactionRepo.delete(id);
};

export const getListOfTransactions = async (filter: {
  startedDate: string;
  finalDate: string;
  origin: "all" | "sale" | "movement";
}) => {
  const start = new Date(`${filter.startedDate} 00:00:00.000000`);
  const end = new Date(`${filter.finalDate} 23:59:59.999999`);
  return transactionRepo.listByDateRange({
    start,
    end,
    origin: filter.origin,
  });
};

export const getTransactionById = async (id: number) => {
  validateNumberID(id, "Transacción");
  const existing = await transactionRepo.findDetailedById(id);
  if (!existing) throw new AppError("(Error) Transacción no encontrada.", 404);
  return existing;
};
