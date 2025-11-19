import { DataSource, Repository } from "typeorm";
import { Account } from "./account.entity.js";
import { Payment } from "../payment/payment.entity.js";
import type { AccountRepository } from "./account.repo.js";

export function makeAccountRepository(ds: DataSource): AccountRepository {
  const accountRepo: Repository<Account> = ds.getRepository(Account);

  return {
    create(data) {
      return accountRepo.create({ ...data, active: true });
    },
    save(entity) {
      return accountRepo.save(entity);
    },

    async findById(id: number) {
      return accountRepo.findOneBy({ id });
    },
    async findActiveById(id) {
      return accountRepo.findOneBy({ id, active: true });
    },
    async findByNormalizedName(normalizedName) {
      return accountRepo.findOneBy({ normalizedName });
    },
    async getAll(includeInactive: boolean) {
      const where = includeInactive ? {} : { active: true };
      return accountRepo.find({ where, order: { normalizedName: "ASC" } });
    },

    async updateFields(id, patch) {
      await accountRepo.update(id, patch);
    },
    async reactivate(id) {
      await accountRepo.update(id, { active: true });
    },
    async softDeactivate(id) {
      await accountRepo.update(id, { active: false });
    },

    // eliminado: operaciones sobre pagos movidas a PaymentRepository
  };
}
