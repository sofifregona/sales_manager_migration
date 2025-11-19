import { DataSource, Repository } from "typeorm";
import { Provider } from "./provider.entity.js";
import type { ProviderRepository } from "./provider.repo.js";
import { Product } from "../product/product.entity.js";

export function makeProviderRepository(ds: DataSource): ProviderRepository {
  const repo: Repository<Provider> = ds.getRepository(Provider);
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
    async findByCuit(cuit) {
      return repo.findOneBy({ cuit });
    },
    async getAll(includeInactive) {
      const where = includeInactive ? {} : { active: true };
      return repo.find({ where });
    },

    async updateFields(id, patch) {
      await repo.update(id, patch);
    },
    async reactivate(id) {
      await repo.update(id, { active: true });
    },
    async deactivate(id) {
      await repo.update(id, { active: false });
    },

    async countActiveProducts(providerId) {
      return productRepo.count({
        where: { provider: { id: providerId }, active: true } as any,
      });
    },
    async clearProviderFromActiveProducts(providerId) {
      await productRepo
        .createQueryBuilder()
        .update()
        .set({ provider: null })
        .where("providerId = :id", { id: providerId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
    async deactivateActiveProducts(providerId) {
      await productRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("providerId = :id", { id: providerId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
  };
}
