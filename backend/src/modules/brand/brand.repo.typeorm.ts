import { DataSource, Repository } from "typeorm";
import { Brand } from "./brand.entity.js";
import type { BrandRepository } from "./brand.repo.js";
import { Product } from "../product/product.entity.js";

export function makeBrandRepository(ds: DataSource): BrandRepository {
  const repo: Repository<Brand> = ds.getRepository(Brand);
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
    async getAll(includeInactive) {
      const where = includeInactive ? {} : { active: true };
      return repo.find({ where, order: { normalizedName: "ASC" } });
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

    async countActiveProducts(brandId) {
      return productRepo.count({
        where: { brand: { id: brandId }, active: true } as any,
      });
    },
    async clearBrandFromActiveProducts(brandId) {
      await productRepo
        .createQueryBuilder()
        .update()
        .set({ brand: null })
        .where("brandId = :id", { id: brandId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
    async deactivateActiveProducts(brandId) {
      await productRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("brandId = :id", { id: brandId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
  };
}
