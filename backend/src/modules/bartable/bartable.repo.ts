import type { Bartable } from "./bartable.entity.js";

export interface BartableRepository {
  create(data: Pick<Bartable, "number"> & { active?: boolean }): Bartable;
  save(entity: Bartable): Promise<Bartable>;

  findById(id: number): Promise<Bartable | null>;
  findActiveById(id: number): Promise<Bartable | null>;
  findByNumber(number: number): Promise<Bartable | null>;
  getAll(includeInactive: boolean): Promise<Bartable[]>;

  updateFields(
    id: number,
    patch: Partial<Pick<Bartable, "number"> & { active: boolean }>
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  deactivate(id: number): Promise<void>;

  // helpers de productos asociados a la marca (temporalmente aquí)
  findOpenSales(bartableId: number): Promise<number>;
}
