import type {
  EmployeeDTO,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "./employee";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createEmployee(data: CreateEmployeePayload) {
  const { name, dni, telephone, email, address } = data;
  return await fetchJson<EmployeeDTO>(
    `${API_BASE_URL}/${ENDPOINTS.employee}`,
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

// ELIMINAR MESA
export async function deactivateEmployee(id: number) {
  return await fetchJson<EmployeeDTO>(
    `${API_BASE_URL}/${ENDPOINTS.employee}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: false }),
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

export async function reactivateEmployeeSwap(
  inactiveId: number,
  currentId: number
) {
  return await fetchJson<EmployeeDTO>(
    `${API_BASE_URL}/${ENDPOINTS.employee}/reactivate-swap`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inactiveId, currentId }),
    }
  );
}

export type EmployeeSortField = "name" | "active";

// TRAER TODAS LAS MESAS
export async function getAllEmployees(
  includeInactive: boolean = false,
  opts: { sortField: EmployeeSortField; sortDirection: "ASC" | "DESC" } = {
    sortField: "name",
    sortDirection: "ASC",
  }
) {
  const params = new URLSearchParams();
  if (includeInactive)
    params.set("includeInactive", includeInactive ? "1" : "0");
  if (opts.sortField) params.set("sortField", opts.sortField);
  if (opts.sortDirection) params.set("sortDirection", opts.sortDirection);

  const qs = params.toString();
  const url = `${API_BASE_URL}/${ENDPOINTS.employee}${qs ? `?${qs}` : ""}`;
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

