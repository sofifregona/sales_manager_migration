import { DataSource, Repository } from "typeorm";
import { Payment } from "./payment.entity.js";
import type { PaymentRepository } from "./payment.repo.js";

export function makePaymentRepository(ds: DataSource): PaymentRepository {
  const paymentRepo: Repository<Payment> = ds.getRepository(Payment);
  return {
    create(data) {
      return paymentRepo.create({ active: true, ...data });
    },
    save(entity) {
      return paymentRepo.save(entity);
    },
    async findById(id) {
      return paymentRepo.findOne({
        where: { id },
        relations: { account: true },
      });
    },
    async findActiveById(id) {
      return paymentRepo.findOne({
        where: { id, active: true },
        relations: { account: true },
      });
    },
    async findByNormalizedName(normalizedName) {
      return paymentRepo.findOneBy({ normalizedName });
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
      return paymentRepo.find({
        where,
        order: { [col]: sortDirection },
        relations: { account: true },
      });
    },
    async updateFields(id, patch) {
      await paymentRepo.update(id, patch);
    },
    async reactivate(id) {
      await paymentRepo.update(id, { active: true });
    },
    async softDeactivate(id) {
      await paymentRepo.update(id, { active: false });
    },
    async countActiveByAccount(accountId) {
      return paymentRepo.count({
        where: { account: { id: accountId }, active: true } as any,
      });
    },
    async deactivateActiveByAccount(accountId) {
      await paymentRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("accountId = :id", { id: accountId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
  };
}
