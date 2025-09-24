import type {
  Bartable,
  CreateBartableFormData,
  UpdateBartableFormData,
} from "~/types/bartable";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createBartable(data: CreateBartableFormData) {
  const { number } = data;
  return await fetchJson<Bartable>(
    `${VITE_API_URL}/api/${ENDPOINTS.bartable}`,
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
export async function updateBartable(data: UpdateBartableFormData) {
  const { id, number } = data;
  return await fetchJson<Bartable>(
    `${VITE_API_URL}/api/${ENDPOINTS.bartable}/${id}`,
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
  return await fetchJson<Bartable>(
    `${VITE_API_URL}/api/${ENDPOINTS.bartable}/${id}/deactivate`,
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
export async function getAllBartables() {
  return await fetchJson<Bartable[]>(
    `${VITE_API_URL}/api/${ENDPOINTS.bartable}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getBartableById(id: number) {
  return await fetchJson<Bartable>(
    `${VITE_API_URL}/api/${ENDPOINTS.bartable}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
