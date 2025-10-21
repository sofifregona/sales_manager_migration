import { DataSource, Repository } from "typeorm";
import { Account } from "./account.entity.js";
import { Payment } from "../payment/payment.entity.js";

/**
 * Narrow repository contract for Account, mapping exactly what the service uses today.
 * This isolates TypeORM behind a small interface that is easy to stub in tests.
 */
export interface AccountRepository {
  // createAccount: repo.create + repo.save
  create(
    data: Pick<Account, "name" | "normalizedName" | "description"> & {
      active?: boolean;
    }
  ): Account;
  save(entity: Account): Promise<Account>;

  // read paths used by service
  findById(id: number): Promise<Account | null>;
  findActiveById(id: number): Promise<Account | null>;
  findByNormalizedName(normalizedName: string): Promise<Account | null>;
  getAll(params: {
    includeInactive: boolean;
    sortField?: "normalizedName" | "active" | "id";
    sortDirection?: "ASC" | "DESC";
  }): Promise<Account[]>;

  // updates used by service
  updateFields(
    id: number,
    patch: Partial<Pick<Account, "name" | "normalizedName" | "description">>
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  softDeactivate(id: number): Promise<void>;

  // cross-aggregate queries used by softDelete cascade logic
  countActivePaymentsByAccount(id: number): Promise<number>;
  deactivateActivePaymentsByAccount(id: number): Promise<void>;
}

export function makeAccountRepository(ds: DataSource): AccountRepository {
  const accountRepo: Repository<Account> = ds.getRepository(Account);
  const paymentRepo: Repository<Payment> = ds.getRepository(Payment);

  return {
    create(data) {
      // default active true if not provided (entity also has default)
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
    async getAll({
      includeInactive,
      sortField = "normalizedName",
      sortDirection = "ASC",
    }) {
      const where = includeInactive ? {} : { active: true };
      // mapear sortField lógico -> columna real
      const map: Record<string, string> = {
        name: "normalizedName",
        active: "active",
        id: "id",
      };
      const col = map[sortField] ?? "normalizedName";
      return accountRepo.find({
        where,
        order: { [col]: sortDirection },
      });
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

    async countActivePaymentsByAccount(id) {
      return paymentRepo.count({ where: { account: { id }, active: true } });
    },
    async deactivateActivePaymentsByAccount(id) {
      await paymentRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("accountId = :id", { id })
        .andWhere("active = :active", { active: true })
        .execute();
    },
  };
}
