import { DataSource, Repository } from "typeorm";
import { Bartable } from "./bartable.entity.js";
import type { BartableRepository } from "./bartable.repo.js";
import { Sale } from "../sale/sale.entity.js";

export function makeBartableRepository(ds: DataSource): BartableRepository {
  const repo: Repository<Bartable> = ds.getRepository(Bartable);
  const salesRepo: Repository<Sale> = ds.getRepository(Sale);

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
    async findByNumber(number) {
      return repo.findOneBy({ number });
    },
    async getAll(includeInactive: boolean) {
      const where = includeInactive ? {} : { active: true };
      return repo.find({ where, order: { number: "ASC" as any } });
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
    async findOpenSales(bartableId) {
      return salesRepo.count({
        where: { bartable: { id: bartableId }, open: true } as any,
      });
    },
  };
}
