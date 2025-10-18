import type {
  ProviderDTO,
  CreateProviderPayload,
  UpdateProviderPayload,
} from "./provider";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createProvider(data: CreateProviderPayload) {
  const { name, cuit, telephone, email, address } = data;
  return await fetchJson<ProviderDTO>(
    `${API_BASE_URL}/${ENDPOINTS.provider}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, cuit, telephone, email, address }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateProvider(data: UpdateProviderPayload) {
  const { id, name, cuit, telephone, email, address } = data;
  return await fetchJson<ProviderDTO>(
    `${API_BASE_URL}/${ENDPOINTS.provider}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, cuit, telephone, email, address }),
    }
  );
}

// ELIMINAR MESA
export async function deactivateProvider(id: number) {
  return await fetchJson<ProviderDTO>(
    `${API_BASE_URL}/${ENDPOINTS.provider}/${id}/deactivate`,
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
export async function getAllProviders() {
  return await fetchJson<ProviderDTO[]>(
    `${API_BASE_URL}/${ENDPOINTS.provider}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getProviderById(id: number) {
  return await fetchJson<ProviderDTO>(
    `${API_BASE_URL}/${ENDPOINTS.provider}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

