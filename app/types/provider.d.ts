export interface Provider {
  id: number;
  name: string;
  normalizedName: string;
  cuit: number | null;
  telephone: number | null;
  email: string | null;
  address: string | null;
  active: boolean;
}

export interface CreateProviderFormData {
  name: string;
  cuit?: number | null;
  telephone?: number | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateProviderFormData extends CreateProviderFormData {
  id: number;
}
