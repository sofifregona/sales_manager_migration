import type { BrandDTO } from "~/feature/brand/types/brand";
import type { CategoryDTO } from "~/feature/category/types/category";
import type { ProviderDTO } from "~/feature/provider/types/provider";
import type { Flash } from "~/types/flash";

export interface ProductDTO {
  id: number;
  code: number;
  name: string;
  normalizedName: string;
  price: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  category: CategoryDTO | null;
  provider: ProviderDTO | null;
  brand: BrandDTO | null;
  active: boolean;
  stockEnabled: boolean;
  quantity: number | null;
  negativeQuantityWarning: boolean;
  minQuantityWarning: boolean;
  minQuantity: number | null;
}

export interface CreateProductPayload {
  code: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  idCategory?: number | null;
  idProvider?: number | null;
  idBrand?: number | null;
  stockEnabled: boolean;
  quantity: number | null;
  negativeQuantityWarning: boolean;
  minQuantityWarning: boolean;
  minQuantity: number | null;
}

export interface UpdateProductPayload extends CreateProductPayload {
  id: number;
}

export interface IncrementPricePayload {
  ids: number[] | [];
  percent: number;
}

export interface ProductLoaderData {
  brands: BrandDTO[] | [];
  categories: CategoryDTO[] | [];
  providers: ProviderDTO[] | [];
  products: ProductDTO[] | [];
  editingProduct: ProductDTO | null;
  flash: Flash;
}
