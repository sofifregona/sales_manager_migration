import type { Account } from "./account.entity.js";

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
  getAll(includeInactive: boolean): Promise<Account[]>;

  // updates used by service
  updateFields(
    id: number,
    patch: Partial<Pick<Account, "name" | "normalizedName" | "description">>
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  softDeactivate(id: number): Promise<void>;

  // cross-aggregate queries used by softDelete cascade logic
}
