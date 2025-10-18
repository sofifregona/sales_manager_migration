import type { Flash } from "~/types/flash";
import type { SaleDTO } from "~/feature/sale/types/sale";

export interface EmployeeDTO {
  id: number;
  name: string;
  normalizedName: string;
  dni: number | null;
  telephone: number | null;
  email: string | null;
  address: string | null;
  activeSale: SaleDTO | null;
  active: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  dni?: number | null;
  telephone?: number | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateEmployeePayload extends CreateEmployeePayload {
  id: number;
}

export interface EmployeeLoaderData {
  employees: EmployeeDTO[] | [];
  editingEmployee: EmployeeDTO | null;
  flash: Flash;
}
