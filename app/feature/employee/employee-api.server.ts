import type {
  EmployeeDTO,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "./employee";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR EMPLEADO
export async function createEmployee(data: CreateEmployeePayload) {
  const { name, dni, telephone, email, address } = data;
  return await fetchJson<EmployeeDTO>(`${API_BASE_URL}/${ENDPOINTS.employee}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, dni, telephone, email, address }),
  });
}

// ACTUALIZAR EMPLEADO
export async function updateEmployee(data: UpdateEmployeePayload) {
  const { id, name, dni, telephone, email, address } = data;
  return await fetchJson<EmployeeDTO>(
    `${API_BASE_URL}/${ENDPOINTS.employee}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, dni, telephone, email, address }),
    }
  );
}

// DESACTIVAR EMPLEADO
export async function deactivateEmployee(id: number) {
  return await fetchJson<EmployeeDTO>(
    `${API_BASE_URL}/${ENDPOINTS.employee}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function reactivateEmployee(id: number) {
  return await fetchJson<EmployeeDTO>(
    `${API_BASE_URL}/${ENDPOINTS.employee}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// TRAER TODOS LOS EMPLEADOS
export async function getAllEmployees(includeInactive: boolean = false) {
  const url = `${API_BASE_URL}/${ENDPOINTS.employee}${
    includeInactive ? `?includeInactive=1` : ""
  }`;
  return await fetchJson<EmployeeDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getEmployeeById(id: number) {
  return await fetchJson<EmployeeDTO>(
    `${API_BASE_URL}/${ENDPOINTS.employee}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
