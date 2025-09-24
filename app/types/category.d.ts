export interface Category {
  id: number;
  name: string;
  normalizedName: string;
  active: boolean;
}

export interface CreateCategoryFormData {
  name: string;
}

export interface UpdateCategoryFormData extends CreateCategoryFormData {
  id: number;
}
