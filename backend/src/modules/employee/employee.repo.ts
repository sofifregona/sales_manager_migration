import type { Employee } from "./employee.entity.js";

export interface EmployeeRepository {
  create(
    data: Pick<
      Employee,
      "name" | "normalizedName" | "dni" | "telephone" | "email" | "address"
    > & { active?: boolean }
  ): Employee;
  save(entity: Employee): Promise<Employee>;

  findById(id: number): Promise<Employee | null>;
  findActiveById(id: number): Promise<Employee | null>;
  findByNormalizedName(normalizedName: string): Promise<Employee | null>;
  findByDni(dni: number): Promise<Employee | null>;
  getAll(includeInactive: boolean): Promise<Employee[]>;

  updateFields(
    id: number,
    patch: Partial<
      Pick<
        Employee,
        "name" | "normalizedName" | "dni" | "telephone" | "email" | "address"
      > & { active: boolean }
    >
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  deactivate(id: number): Promise<void>;

  // helpers de productos asociados a la marca (temporalmente aquí)
  findOpenSales(employeeId: number): Promise<number>;
}
