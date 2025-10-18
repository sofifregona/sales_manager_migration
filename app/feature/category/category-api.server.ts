import type {
  CategoryDTO,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "~/feature/category/category";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createCategory(data: CreateCategoryPayload) {
  const { name } = data;
  return await fetchJson<CategoryDTO>(
    `${API_BASE_URL}/${ENDPOINTS.category}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateCategory(data: UpdateCategoryPayload) {
  const { id, name } = data;
  return await fetchJson<CategoryDTO>(
    `${API_BASE_URL}/${ENDPOINTS.category}/${id}`,
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
export async function deactivateCategory(
  id: number,
  strategy?: "clear-products-category" | "deactivate-products" | "cancel"
) {
  return await fetchJson<CategoryDTO>(
    `${API_BASE_URL}/${ENDPOINTS.category}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strategy ? { strategy } : {}),
    }
  );
}

export async function reactivateCategory(id: number) {
  return await fetchJson<CategoryDTO>(
    `${API_BASE_URL}/${ENDPOINTS.category}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function reactivateCategorySwap(
  inactiveId: number,
  currentId: number
) {
  return await fetchJson<CategoryDTO>(
    `${API_BASE_URL}/${ENDPOINTS.category}/reactivate-swap`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inactiveId, currentId }),
    }
  );
}

export type AccountSortField = "name" | "active";

// TRAER TODAS LAS MESAS
export async function getAllCategories(
  includeInactive: boolean = false,
  opts: { sortField: AccountSortField; sortDirection: "ASC" | "DESC" } = {
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
  const url = `${API_BASE_URL}/${ENDPOINTS.category}${qs ? `?${qs}` : ""}`;
  return await fetchJson<CategoryDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getCategoryById(id: number) {
  return await fetchJson<CategoryDTO>(
    `${API_BASE_URL}/${ENDPOINTS.category}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

