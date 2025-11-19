import type { Provider } from "./provider.entity.js";

export interface ProviderRepository {
  create(
    data: Pick<
      Provider,
      "name" | "normalizedName" | "cuit" | "telephone" | "email" | "address"
    > & { active?: boolean }
  ): Provider;
  save(entity: Provider): Promise<Provider>;

  findById(id: number): Promise<Provider | null>;
  findActiveById(id: number): Promise<Provider | null>;
  findByNormalizedName(normalizedName: string): Promise<Provider | null>;
  findByCuit(cuit: number): Promise<Provider | null>;
  getAll(includeInactive: boolean): Promise<Provider[]>;

  updateFields(
    id: number,
    patch: Partial<
      Pick<
        Provider,
        "name" | "normalizedName" | "cuit" | "telephone" | "email" | "address"
      > & { active: boolean }
    >
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  deactivate(id: number): Promise<void>;

  // helpers de productos asociados a la marca (temporalmente aquí)
  countActiveProducts(providerId: number): Promise<number>;
  clearProviderFromActiveProducts(providerId: number): Promise<void>;
  deactivateActiveProducts(providerId: number): Promise<void>;
}
