import type { Flash } from "~/types/flash";

export interface ProviderDTO {
  id: number;
  name: string;
  normalizedName: string;
  cuit: number | null;
  telephone: number | null;
  email: string | null;
  address: string | null;
  active: boolean;
}

export interface CreateProviderPayload {
  name: string;
  cuit?: number | null;
  telephone?: number | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateProviderPayload {
  id: number;
  name?: string;
  cuit?: number | null;
  telephone?: number | null;
  email?: string | null;
  address?: string | null;
}

export interface ProviderLoaderData {
  providers: ProviderDTO[] | [];
  editingProvider: ProviderDTO | null;
  flash: Flash;
}
