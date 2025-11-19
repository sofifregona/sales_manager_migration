import type { UpdateResult } from "typeorm";
import type { Product } from "./product.entity.js";

// Interfaz alineada al patrón de AccountRepository
export interface ProductRepository {
  create(
    data: Pick<
      Product,
      | "name"
      | "normalizedName"
      | "code"
      | "price"
      | "stockEnabled"
      | "quantity"
      | "negativeQuantityWarning"
      | "minQuantityWarning"
      | "minQuantity"
      | "imageUrl"
      | "imagePublicId"
    > & { active?: boolean }
  ): Product;
  save(entity: Product): Promise<Product>;

  findById(id: number): Promise<Product | null>;
  findActiveById(id: number): Promise<Product | null>;
  findByNormalizedName(normalizedName: string): Promise<Product | null>;
  findByCode(code: number): Promise<Product | null>;

  getListOfProducts(params: {
    includeInactive: boolean;
    filter?: {
      name?: string; // ya normalizada
      code?: string; // solo dígitos, e.g. "01"
      minPrice?: number;
      maxPrice?: number;
      idProvider?: number | null; // undefined = no filtra; null = solo nulos; number = por id
      idCategory?: number | null;
      idBrand?: number | null;
    };
    sort?: {
      field?:
        | "normalizedName"
        | "code"
        | "price"
        | "provider"
        | "brand"
        | "category"
        | "active";
      direction?: "ASC" | "DESC";
    };
  }): Promise<Product[]>;

  updateFields(id: number, patch: Partial<Product>): Promise<void>;
  reactivate(id: number): Promise<void>;
  deactivate(id: number): Promise<void>;
  incrementPrices(ids: number[], percent: number): Promise<UpdateResult>;
}
