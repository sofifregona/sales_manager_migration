import type { AccountDTO } from "~/feature/account/account";
import type { SaleDTO } from "~/feature/sale/types/sale";
import type { Flash } from "~/types/flash";
import type { UserDTO } from "../user/user";

export interface TransactionDTO {
  id: number;
  dateTime: Date;
  createdBy: UserDTO;
  account: AccountDTO;
  type: "income" | "expense";
  origin: "sale" | "movement";
  sale: SaleDTO | null;
  amount: number;
  description: string | null;
}

export interface CreateTransactionPayload {
  idAccount: number;
  amount: number;
}

export interface CreateMovementPayload
  extends Partial<CreateTransactionPayload> {
  type: "income" | "expense";
  origin: "movement";
  description?: string | null;
}

export interface CreateSaleMovementPayload
  extends Partial<CreateTransactionPayload> {
  origin: "sale";
  saleId: number;
}

export interface UpdateMovementPayload extends Partial<CreateMovementPayload> {
  id: number;
  type: "income" | "expense";
  amount: number;
  description?: string | null;
}

export interface TransactionLoaderData {
  accounts: AccountDTO[] | [];
  transactions: TransactionDTO[] | [];
  editingTransaction: TransactionDTO | null;
  flash: Flash;
}
