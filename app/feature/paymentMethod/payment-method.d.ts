import type { AccountDTO } from "~/feature/account/account";
import type { Flash } from "~/types/flash";

export interface PaymentMethodDTO {
  id: number;
  name: string;
  normalizedName: string;
  account: AccountDTO;
  active: boolean;
}

export interface CreatePaymentMethodPayload {
  name: string;
  idAccount: number;
}

export interface UpdatePaymentMethodPayload extends CreatePaymentMethodPayload {
  id: number;
}

export interface PaymentMethodLoaderData {
  accounts: AccountDTO[] | [];
  paymentMethods: PaymentMethodDTO[] | [];
  editingPaymentMethod: PaymentMethodDTO | null;
  flash: Flash;
}
