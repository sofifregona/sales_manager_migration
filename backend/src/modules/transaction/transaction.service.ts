import { transactionRepo } from "./transaction.repo.js";
import { Transaction } from "./transaction.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validatePositiveNumber,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { getAccountById } from "../account/account.service.js";
import { Raw, type FindOptionsWhere } from "typeorm";
import { accountRepo } from "../account/account.repo.js";
import { Account } from "../account/account.entity.js";
import { getSaleById } from "../sale/sale.service.js";
import type { Sale } from "../sale/sale.entity.js";

// SERVICE FOR CREATE A BARTABLE
export const createTransaction = async (data: {
  idAccount: number;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  origin: "sale" | "movement";
  idSale: number | null;
}) => {
  const { idAccount, type, amount, description, origin, idSale } = data;

  validateNumberID(idAccount, "Cuenta");
  const account = await getAccountById(idAccount);
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

  let sale: Sale | null = null;
  if (idSale) {
    validateNumberID(idSale, "Venta");
    sale = await getSaleById(idSale);
    if (!sale) {
      throw new AppError("(Error) Venta no encontrada.", 404);
    }
  }

  // If it doesn't exist, create a new one
  const newTransaction = Object.assign(new Transaction(), {
    dateTime: new Date(),
    account,
    type: origin === "sale" ? "income" : type,
    origin,
    amount,
    description: description ?? null,
    sale: idSale ? sale : null,
  });

  return await transactionRepo.save(newTransaction);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateTransaction = async (updatedData: {
  id: number;
  idAccount?: number;
  type?: "expense" | "income";
  amount?: number;
  description?: string;
}) => {
  const { id, idAccount, type, amount, description } = updatedData;
  validateNumberID(id, "Transacción");
  const existing = await transactionRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Transacción no encontrada.", 404);
  if (existing.origin === "sale") {
    throw new AppError(
      `(Error) No se puede modificar una transacción proveniente de las ventas.
      Si desea modificar una venta, vaya a la lista de ventas.`
    );
  }

  const data: Partial<Transaction> = {};

  if (idAccount !== undefined) {
    validateNumberID(idAccount, "Cuenta");
    const account = await getAccountById(idAccount);
    data.account = account as Account;
  }

  if (type !== undefined) {
    if (!["expense", "income"].includes(type)) {
      throw new AppError("(Error) Operación no soportada.", 422);
    }
    data.type = type;
  }

  if (amount !== undefined) {
    validatePositiveNumber(amount, "Monto");
    data.amount = amount;
  }

  if (description !== undefined) {
    data.description = description;
  }

  await transactionRepo.update(id, data);
  return await transactionRepo.findOneBy({ id });
};

export const deleteTransaction = async (id: number) => {
  validateNumberID(id, "Transacción");

  const existing = await transactionRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Transacción no encontrada.", 404);
  await transactionRepo.delete(id);
};

// SERVICE FOR GETTING ALL BARTABLES
export const getListOfTransactions = async (filter: {
  startedDate: string;
  finalDate: string;
  origin: "all" | "sale" | "movement";
}) => {
  const startedDate = `${filter.startedDate} 00:00:00.000000`; // inclusive
  const finalDate = `${filter.finalDate} 23:59:59.999999`;

  const where: FindOptionsWhere<Transaction> = {
    dateTime: Raw((alias) => `${alias} >= :start AND ${alias} < :end`, {
      start: startedDate,
      end: finalDate,
    }),
  };
  if (origin === "sale" || origin === "movement") {
    where.origin = origin;
  }
  return transactionRepo.find({
    where,
    relations: { account: true }, // equivalente a leftJoinAndSelect
    order: { dateTime: "DESC" },
  });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getTransactionById = async (id: number) => {
  validateNumberID(id, "Transacción");
  const existing = await transactionRepo.findOne({
    where: { id },
    relations: { account: true },
  });
  if (!existing) throw new AppError("(Error) Transacción no encontrada.", 404);
  return existing;
};
