export interface Account {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}

export interface CreateAccountFormData {
  name: string;
  description?: string | null;
}

export interface UpdateAccountFormData extends CreateAccountFormData {
  id: number;
}
