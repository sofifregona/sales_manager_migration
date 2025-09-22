export interface Employee {
  id: number;
  name: string;
  normalizedName: string;
  dni: number | null;
  telephone: number | null;
  email: string | null;
  address: string | null;
  active: boolean;
}

export interface CreateEmployeeFormData {
  name: string;
  dni?: number | null;
  telephone?: number | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateEmployeeFormData extends CreateEmployeeFormData {
  id: number;
}
