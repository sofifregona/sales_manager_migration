import type { Flash } from "~/types/flash";

export interface CategoryDTO {
  id: number;
  name: string;
  normalizedName: string;
  active: boolean;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {
  id: number;
}

export interface CategoryLoaderData {
  categories: CategoryDTO[] | [];
  editingCategory: CategoryDTO | null;
  flash: Flash;
}
