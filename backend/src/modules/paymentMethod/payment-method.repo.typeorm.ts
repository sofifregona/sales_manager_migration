import { DataSource, Repository } from "typeorm";
import { PaymentMethod } from "./payment-method.entity.js";
import type { PaymentMethodRepository } from "./payment-method.repo.js";

export function makePaymentMethodRepository(
  ds: DataSource
): PaymentMethodRepository {
  const paymentMethodRepo: Repository<PaymentMethod> =
    ds.getRepository(PaymentMethod);
  return {
    create(data) {
      return paymentMethodRepo.create({ active: true, ...data });
    },
    save(entity) {
      return paymentMethodRepo.save(entity);
    },
    async findById(id) {
      return paymentMethodRepo.findOne({
        where: { id },
        relations: { account: true },
      });
    },
    async findActiveById(id) {
      return paymentMethodRepo.findOne({
        where: { id, active: true },
        relations: { account: true },
      });
    },
    async findByNormalizedName(normalizedName) {
      return paymentMethodRepo.findOneBy({ normalizedName });
    },
    async getAll({
      includeInactive,
      sortField = "normalizedName",
      sortDirection = "ASC",
    }) {
      const where = includeInactive ? {} : { active: true };
      const map: Record<string, string> = {
        name: "normalizedName",
        active: "active",
        id: "id",
      };
      const col = map[sortField] ?? "normalizedName";
      return paymentMethodRepo.find({
        where,
        order: { [col]: sortDirection },
        relations: { account: true },
      });
    },
    async updateFields(id, patch) {
      await paymentMethodRepo.update(id, patch);
    },
    async reactivate(id) {
      await paymentMethodRepo.update(id, { active: true });
    },
    async softDeactivate(id) {
      await paymentMethodRepo.update(id, { active: false });
    },
    async countActiveByAccount(accountId) {
      return paymentMethodRepo.count({
        where: { account: { id: accountId }, active: true } as any,
      });
    },
    async deactivateActiveByAccount(accountId) {
      await paymentMethodRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("accountId = :id", { id: accountId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
  };
}
