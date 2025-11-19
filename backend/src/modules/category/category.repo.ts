import type { Category } from "./category.entity.js";

export interface CategoryRepository {
  create(
    data: Pick<Category, "name" | "normalizedName"> & { active?: boolean }
  ): Category;
  save(entity: Category): Promise<Category>;

  findById(id: number): Promise<Category | null>;
  findActiveById(id: number): Promise<Category | null>;
  findByNormalizedName(normalizedName: string): Promise<Category | null>;
  getAll(includeInactive: boolean): Promise<Category[]>;

  updateFields(
    id: number,
    patch: Partial<
      Pick<Category, "name" | "normalizedName"> & { active: boolean }
    >
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  softDeactivate(id: number): Promise<void>;

  // helpers de productos asociados a la marca (temporalmente aquí)
  countActiveProducts(categoryId: number): Promise<number>;
  clearCategoryFromActiveProducts(categoryId: number): Promise<void>;
  deactivateActiveProducts(categoryId: number): Promise<void>;
}
