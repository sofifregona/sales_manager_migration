import type {
  Category,
  CreateCategoryFormData,
  UpdateCategoryFormData,
} from "~/types/category";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createCategory(data: CreateCategoryFormData) {
  const { name } = data;
  return await fetchJson<Category>(
    `${VITE_API_URL}/api/${ENDPOINTS.category}`,
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
export async function updateCategory(data: UpdateCategoryFormData) {
  const { id, name } = data;
  return await fetchJson<Category>(
    `${VITE_API_URL}/api/${ENDPOINTS.category}/${id}`,
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
export async function deactivateCategory(id: number) {
  return await fetchJson<Category>(
    `${VITE_API_URL}/api/${ENDPOINTS.category}/${id}/deactivate`,
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
export async function getAllCategories() {
  return await fetchJson<Category[]>(
    `${VITE_API_URL}/api/${ENDPOINTS.category}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getCategoryById(id: number) {
  return await fetchJson<Category>(
    `${VITE_API_URL}/api/${ENDPOINTS.category}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
