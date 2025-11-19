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
  return await fetchJson<BartableDTO>(`${API_BASE_URL}/${ENDPOINTS.bartable}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number }),
  });
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

export async function getAllBartables(includeInactive: boolean = false) {
  const url = `${API_BASE_URL}/${ENDPOINTS.bartable}${
    includeInactive ? `?includeInactive=1` : ""
  }`;
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
