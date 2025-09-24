import { Provider } from "./provider";
import { Category } from "./category";
import { Brand } from "./brand";

export interface Product {
  id: number;
  code: number;
  name: string;
  normalizedName: string;
  price: number;
  category: Category | null;
  provider: Provider | null;
  brand: Brand | null;
  active: boolean;
}

export interface CreateProductFormData {
  code: number;
  name: string;
  price: number;
  idCategory?: number | null;
  idProvider?: number | null;
  idBrand?: number | null;
}

export interface UpdateProductFormData extends CreateProductFormData {
  id: number;
}

export interface IncrementProductFormData {
  ids: number[];
  percent: number;
}
