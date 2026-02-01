import type { PaymentMethod } from "./payment-method.entity.js";

// Interfaz alineada al patrón de AccountRepository
export interface PaymentMethodRepository {
  create(
    data: Pick<PaymentMethod, "name" | "normalizedName" | "account">
  ): PaymentMethod;
  save(entity: PaymentMethod): Promise<PaymentMethod>;

  findById(id: number): Promise<PaymentMethod | null>;
  findActiveById(id: number): Promise<PaymentMethod | null>;
  findByNormalizedName(normalizedName: string): Promise<PaymentMethod | null>;

  getAll(params: {
    includeInactive: boolean;
    sortField?: "normalizedName" | "active" | "id";
    sortDirection?: "ASC" | "DESC";
  }): Promise<PaymentMethod[]>;

  updateFields(
    id: number,
    patch: Partial<Pick<PaymentMethod, "name" | "normalizedName" | "active">>
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  softDeactivate(id: number): Promise<void>;

  // Operaciones cruzadas por cuenta
  countActiveByAccount(accountId: number): Promise<number>;
  deactivateActiveByAccount(accountId: number): Promise<void>;
}
