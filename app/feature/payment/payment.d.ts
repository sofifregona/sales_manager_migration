import type { AccountDTO } from "~/feature/account/account";
import type { Flash } from "~/types/flash";

export interface PaymentDTO {
  id: number;
  name: string;
  normalizedName: string;
  account: AccountDTO;
  active: boolean;
}

export interface CreatePaymentPayload {
  name: string;
  idAccount: number;
}

export interface UpdatePaymentPayload extends CreatePaymentPayload {
  id: number;
}

export interface PaymentLoaderData {
  accounts: AccountDTO[] | [];
  payments: PaymentDTO[] | [];
  editingPayment: PaymentDTO | null;
  flash: Flash;
}
