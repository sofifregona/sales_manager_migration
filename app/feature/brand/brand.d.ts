import type { Flash } from "~/types/flash";

export interface BrandDTO {
  id: number;
  name: string;
  normalizedName: string;
  active: boolean;
}

export interface CreateBrandPayload {
  name: string;
}

export interface UpdateBrandPayload extends CreateBrandPayload {
  id: number;
}

export interface BrandLoaderData {
  brands: BrandDTO[] | [];
  editingBrand: BrandDTO | null;
  flash: Flash;
}
