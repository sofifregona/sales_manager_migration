import type {
  BrandDTO,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "~/feature/brand/brand";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createBrand(data: CreateBrandPayload) {
  const { name } = data;
  return await fetchJson<BrandDTO>(`${API_BASE_URL}/${ENDPOINTS.brand}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
}

// ACTUALIZAR MESA
export async function updateBrand(data: UpdateBrandPayload) {
  const { id, name } = data;
  return await fetchJson<BrandDTO>(
    `${API_BASE_URL}/${ENDPOINTS.brand}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    }
  );
}

// ELIMINAR MESA
export async function deactivateBrand(
  id: number,
  strategy?: "clear-products-brand" | "deactivate-products" | "cancel"
) {
  return await fetchJson<BrandDTO>(
    `${API_BASE_URL}/${ENDPOINTS.brand}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strategy ? { strategy } : {}),
    }
  );
}

export async function reactivateBrand(id: number) {
  return await fetchJson<BrandDTO>(
    `${API_BASE_URL}/${ENDPOINTS.brand}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function reactivateBrandSwap(
  inactiveId: number,
  currentId: number
) {
  return await fetchJson<BrandDTO>(
    `${API_BASE_URL}/${ENDPOINTS.brand}/reactivate-swap`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inactiveId, currentId }),
    }
  );
}

export type BrandSortField = "name" | "active";

// TRAER TODAS LAS MESAS
export async function getAllBrands(
  includeInactive: boolean = false,
  opts: { sortField: BrandSortField; sortDirection: "ASC" | "DESC" } = {
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
  const url = `${API_BASE_URL}/${ENDPOINTS.brand}${qs ? `?${qs}` : ""}`;
  return await fetchJson<BrandDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getBrandById(id: number) {
  return await fetchJson<BrandDTO>(
    `${API_BASE_URL}/${ENDPOINTS.brand}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

