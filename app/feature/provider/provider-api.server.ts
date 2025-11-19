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
  return await fetchJson<ProviderDTO>(`${API_BASE_URL}/${ENDPOINTS.provider}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, cuit, telephone, email, address }),
  });
}

// ACTUALIZAR MESA
type ProviderUpdateKey = "name" | "cuit" | "telephone" | "email" | "address";

export async function updateProvider(data: UpdateProviderPayload) {
  const { id, ...rest } = data;
  const body: Record<string, unknown> = {};

  (["name", "cuit", "telephone", "email", "address"] as ProviderUpdateKey[]).forEach(
    (key) => {
      const value = rest[key];
      if (value !== undefined) {
        body[key] = value;
      }
    }
  );

  return await fetchJson<ProviderDTO>(
    `${API_BASE_URL}/${ENDPOINTS.provider}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

// ELIMINAR MESA
export async function deactivateProvider(
  id: number,
  strategy?:
    | "clear-products-provider"
    | "cascade-deactivate-products"
    | "cancel"
) {
  return await fetchJson<ProviderDTO>(
    `${API_BASE_URL}/${ENDPOINTS.provider}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strategy ? { strategy } : {}),
    }
  );
}

export async function reactivateProvider(id: number) {
  return await fetchJson<ProviderDTO>(
    `${API_BASE_URL}/${ENDPOINTS.provider}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// No hay swap en Provider (sin cookies ni overlay de reactivación)

// TRAER TODOS LOS PROVEEDORES
export async function getAllProviders(includeInactive: boolean = false) {
  const url = `${API_BASE_URL}/${ENDPOINTS.provider}${
    includeInactive ? `?includeInactive=1` : ""
  }`;
  return await fetchJson<ProviderDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
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
