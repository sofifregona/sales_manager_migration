import { DataSource, Repository } from "typeorm";
import { Category } from "./category.entity.js";
import type { CategoryRepository } from "./category.repo.js";
import { Product } from "../product/product.entity.js";

export function makeCategoryRepository(ds: DataSource): CategoryRepository {
  const repo: Repository<Category> = ds.getRepository(Category);
  const productRepo: Repository<Product> = ds.getRepository(Product);

  return {
    create(data) {
      return repo.create({ ...data, active: data.active ?? true });
    },
    save(entity) {
      return repo.save(entity);
    },

    async findById(id) {
      return repo.findOneBy({ id });
    },
    async findActiveById(id) {
      return repo.findOneBy({ id, active: true });
    },
    async findByNormalizedName(normalizedName) {
      return repo.findOneBy({ normalizedName });
    },
    async getAll(includeInactive: boolean) {
      const where = includeInactive ? {} : { active: true };
      return repo.find({ where, order: { normalizedName: "ASC" as any } });
    },

    async updateFields(id, patch) {
      await repo.update(id, patch);
    },
    async reactivate(id) {
      await repo.update(id, { active: true });
    },
    async softDeactivate(id) {
      await repo.update(id, { active: false });
    },

    async countActiveProducts(categoryId) {
      return productRepo.count({
        where: { category: { id: categoryId }, active: true } as any,
      });
    },
    async clearCategoryFromActiveProducts(categoryId) {
      await productRepo
        .createQueryBuilder()
        .update()
        .set({ category: null })
        .where("categoryId = :id", { id: categoryId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
    async deactivateActiveProducts(categoryId) {
      await productRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("categoryId = :id", { id: categoryId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
  };
}
