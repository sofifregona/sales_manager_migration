import type {
  ProviderDTO,
  CreateProviderPayload,
  UpdateProviderPayload,
} from "~/types/provider";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createProvider(data: CreateProviderPayload) {
  const { name, cuit, telephone, email, address } = data;
  return await fetchJson<ProviderDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.provider}`,
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
    `${VITE_API_URL}/api/${ENDPOINTS.provider}/${id}`,
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
    `${VITE_API_URL}/api/${ENDPOINTS.provider}/${id}/deactivate`,
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
    `${VITE_API_URL}/api/${ENDPOINTS.provider}`,
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
    `${VITE_API_URL}/api/${ENDPOINTS.provider}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
