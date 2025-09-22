import type {
  Employee,
  CreateEmployeeFormData,
  UpdateEmployeeFormData,
} from "~/types/employee";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createEmployee(data: CreateEmployeeFormData) {
  const { name, dni, telephone, email, address } = data;
  return await fetchJson<Employee>(
    `${VITE_API_URL}/api/${ENDPOINTS.employee}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, dni, telephone, email, address }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateEmployee(data: UpdateEmployeeFormData) {
  const { id, name, dni, telephone, email, address } = data;
  return await fetchJson<Employee>(
    `${VITE_API_URL}/api/${ENDPOINTS.employee}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, dni, telephone, email, address }),
    }
  );
}

// ELIMINAR MESA
export async function deactivateEmployee(id: number) {
  return await fetchJson<Employee>(
    `${VITE_API_URL}/api/${ENDPOINTS.employee}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: false }),
    }
  );
}

// TRAER TODAS LAS MESAS
export async function getAllEmployees() {
  return await fetchJson<Employee[]>(
    `${VITE_API_URL}/api/${ENDPOINTS.employee}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getEmployeeById(id: number) {
  return await fetchJson<Employee>(
    `${VITE_API_URL}/api/${ENDPOINTS.employee}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
