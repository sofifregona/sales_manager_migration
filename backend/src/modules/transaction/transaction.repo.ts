import type { Transaction } from "./transaction.entity.js";

export type TransactionCreateData = Pick<
  Transaction,
  | "account"
  | "type"
  | "origin"
  | "amount"
  | "description"
  | "payment"
  | "createdBy"
>;
export type TransactionUpdateFields = Partial<
  Pick<Transaction, "account" | "type" | "origin" | "amount" | "description">
>;

export interface TransactionRepository {
  create(data: TransactionCreateData): Transaction;
  save(entity: Transaction): Promise<Transaction>;

  findSimpleById(id: number): Promise<Transaction | null>;
  findDetailedById(id: number): Promise<Transaction | null>;

  updateFields(id: number, patch: TransactionUpdateFields): Promise<void>;
  delete(id: number): Promise<void>;

  listByDateRange(filter: {
    start: Date;
    end: Date;
    origin: "all" | "sale" | "movement";
  }): Promise<Transaction[]>;
}
