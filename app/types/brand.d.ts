export interface Brand {
  id: number;
  name: string;
  normalizedName: string;
  active: boolean;
}

export interface CreateBrandFormData {
  name: string;
}

export interface UpdateBrandFormData extends CreateBrandFormData {
  id: number;
}
