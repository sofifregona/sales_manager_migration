import type { Brand } from "./brand.entity.js";

export interface BrandRepository {
  create(
    data: Pick<Brand, "name" | "normalizedName"> & { active?: boolean }
  ): Brand;
  save(entity: Brand): Promise<Brand>;

  findById(id: number): Promise<Brand | null>;
  findActiveById(id: number): Promise<Brand | null>;
  findByNormalizedName(normalizedName: string): Promise<Brand | null>;
  getAll(includeInactive: boolean): Promise<Brand[]>;

  updateFields(
    id: number,
    patch: Partial<Pick<Brand, "name" | "normalizedName"> & { active: boolean }>
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  softDeactivate(id: number): Promise<void>;

  // helpers de productos asociados a la marca (temporalmente aquí)
  countActiveProducts(brandId: number): Promise<number>;
  clearBrandFromActiveProducts(brandId: number): Promise<void>;
  deactivateActiveProducts(brandId: number): Promise<void>;
}
