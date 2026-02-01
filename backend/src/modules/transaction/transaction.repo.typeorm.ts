import { DataSource, Raw } from "typeorm";
import { Transaction } from "./transaction.entity.js";
import type {
  TransactionCreateData,
  TransactionRepository,
  TransactionUpdateFields,
} from "./transaction.repo.js";

export function makeTransactionRepository(
  ds: DataSource
): TransactionRepository {
  const repo = ds.getRepository(Transaction);

  return {
    create(data: TransactionCreateData) {
      return repo.create(data);
    },
    save(entity) {
      return repo.save(entity);
    },
    async findSimpleById(id) {
      return repo.findOne({ where: { id } });
    },
    async findDetailedById(id) {
      return repo.findOne({
        where: { id },
        relations: { account: true, createdBy: true, payment: true },
      });
    },
    async updateFields(id, patch: TransactionUpdateFields) {
      await repo.update(id, patch);
    },
    async delete(id) {
      await repo.delete(id);
    },
    async listByDateRange({ start, end, origin }) {
      const where: Record<string, unknown> = {
        dateTime: Raw((alias) => `${alias} >= :start AND ${alias} <= :end`, {
          start,
          end,
        }),
      };
      if (origin !== "all") {
        where.origin = origin;
      }
      return repo.find({
        where,
        relations: { account: true, createdBy: true },
        order: { dateTime: "DESC" },
      });
    },
  };
}
