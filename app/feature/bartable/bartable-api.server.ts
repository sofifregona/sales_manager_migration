import type {
  BartableDTO,
  CreateBartablePayload,
  UpdateBartablePayload,
} from "~/feature/bartable/bartable";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createBartable(data: CreateBartablePayload) {
  const { number } = data;
  return await fetchJson<BartableDTO>(
    `${API_BASE_URL}/${ENDPOINTS.bartable}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateBartable(data: UpdateBartablePayload) {
  const { id, number } = data;
  return await fetchJson<BartableDTO>(
    `${API_BASE_URL}/${ENDPOINTS.bartable}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number }),
    }
  );
}

// ELIMINAR MESA
export async function deactivateBartable(id: number) {
  return await fetchJson<BartableDTO>(
    `${API_BASE_URL}/${ENDPOINTS.bartable}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: false }),
    }
  );
}

export async function reactivateBartable(id: number) {
  return await fetchJson<BartableDTO>(
    `${API_BASE_URL}/${ENDPOINTS.bartable}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function reactivateBartableSwap(
  inactiveId: number,
  currentId: number
) {
  return await fetchJson<BartableDTO>(
    `${API_BASE_URL}/${ENDPOINTS.bartable}/reactivate-swap`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inactiveId, currentId }),
    }
  );
}

export type BartableSortField = "number" | "active";

export async function getAllBartables(
  includeInactive: boolean = false,
  opts: { sortField: BartableSortField; sortDirection: "ASC" | "DESC" } = {
    sortField: "number",
    sortDirection: "ASC",
  }
) {
  const params = new URLSearchParams();
  if (includeInactive)
    params.set("includeInactive", includeInactive ? "1" : "0");
  if (opts.sortField) params.set("sortField", opts.sortField);
  if (opts.sortDirection) params.set("sortDirection", opts.sortDirection);

  const qs = params.toString();
  const url = `${API_BASE_URL}/${ENDPOINTS.bartable}${qs ? `?${qs}` : ""}`;
  return await fetchJson<BartableDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getBartableById(id: number) {
  return await fetchJson<BartableDTO>(
    `${API_BASE_URL}/${ENDPOINTS.bartable}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

