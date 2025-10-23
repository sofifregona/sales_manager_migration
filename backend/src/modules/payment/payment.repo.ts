import type { Payment } from "./payment.entity.js";

// Interfaz alineada al patrón de AccountRepository
export interface PaymentRepository {
  create(
    data: Pick<Payment, "name" | "normalizedName"> & { active?: boolean }
  ): Payment;
  save(entity: Payment): Promise<Payment>;

  findById(id: number): Promise<Payment | null>;
  findActiveById(id: number): Promise<Payment | null>;
  findByNormalizedName(normalizedName: string): Promise<Payment | null>;

  getAll(params: {
    includeInactive: boolean;
    sortField?: "normalizedName" | "active" | "id";
    sortDirection?: "ASC" | "DESC";
  }): Promise<Payment[]>;

  updateFields(
    id: number,
    patch: Partial<Pick<Payment, "name" | "normalizedName" | "active">>
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  softDeactivate(id: number): Promise<void>;

  // Operaciones cruzadas por cuenta
  countActiveByAccount(accountId: number): Promise<number>;
  deactivateActiveByAccount(accountId: number): Promise<void>;
}
