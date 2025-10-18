import type { Flash } from "~/types/flash";

export interface AccountDTO {
  id: number;
  name: string;
  normalizedName: string;
  description: string | null;
  active: boolean;
}

export interface CreateAccountPayload {
  name: string;
  description?: string | null;
}

export interface UpdateAccountPayload extends CreateAccountPayload {
  id: number;
}

export interface AccountLoaderData {
  accounts: AccountDTO[] | [];
  editingAccount: AccountDTO | null;
  flash: Flash;
}
