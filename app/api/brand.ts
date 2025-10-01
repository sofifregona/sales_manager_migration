import type {
  BrandDTO,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "~/types/brand";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createBrand(data: CreateBrandPayload) {
  const { name } = data;
  return await fetchJson<BrandDTO>(`${VITE_API_URL}/api/${ENDPOINTS.brand}`, {
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
    `${VITE_API_URL}/api/${ENDPOINTS.brand}/${id}`,
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
export async function deactivateBrand(id: number) {
  return await fetchJson<BrandDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.brand}/${id}/deactivate`,
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
export async function getAllBrands() {
  return await fetchJson<BrandDTO[]>(`${VITE_API_URL}/api/${ENDPOINTS.brand}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getBrandById(id: number) {
  return await fetchJson<BrandDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.brand}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
