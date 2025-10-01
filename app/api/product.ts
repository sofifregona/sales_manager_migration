import type {
  ProductDTO,
  CreateProductPayload,
  UpdateProductPayload,
  IncrementPricePayload,
} from "~/types/product";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createProduct(data: CreateProductPayload) {
  const { name, code, price, idCategory, idBrand, idProvider } = data;
  return await fetchJson<ProductDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.product}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        code,
        price,
        idCategory,
        idBrand,
        idProvider,
      }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateProduct(data: UpdateProductPayload) {
  const { id, name, code, price, idCategory, idBrand, idProvider } = data;
  return await fetchJson<ProductDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.product}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        code,
        price,
        idCategory,
        idBrand,
        idProvider,
      }),
    }
  );
}

export async function incrementProduct(data: IncrementPricePayload) {
  const { ids, percent } = data;
  return await fetchJson<ProductDTO[]>(
    `${VITE_API_URL}/api/${ENDPOINTS.product}/increment`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids,
        percent,
      }),
    }
  );
}

// ELIMINAR MESA
export async function deactivateProduct(id: number) {
  return await fetchJson<ProductDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.product}/${id}/deactivate`,
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
export async function getListOfProducts(filters: {
  name?: string | null;
  code?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  idProvider?: string | null;
  idBrand?: string | null;
  idCategory?: string | null;
  sortField: string;
  sortDirection: string;
}) {
  const qs = new URLSearchParams();

  if (filters.name !== undefined) qs.set("name", String(filters.name));
  if (filters.code !== undefined) qs.set("code", String(filters.code)); // map
  if (filters.minPrice !== undefined)
    qs.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    qs.set("maxPrice", String(filters.maxPrice));
  if (filters.idProvider !== undefined)
    qs.set("idProvider", String(filters.idProvider));
  if (filters.idBrand !== undefined) qs.set("idBrand", String(filters.idBrand));
  if (filters.idCategory !== undefined)
    qs.set("idCategory", String(filters.idCategory));
  qs.set("sortField", String(filters.sortField ?? "name"));
  qs.set("sortDirection", String(filters.sortDirection ?? "ASC"));
  return await fetchJson<ProductDTO[]>(
    `${VITE_API_URL}/api/${ENDPOINTS.product}${qs.toString() ? `?${qs}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getProductById(id: number) {
  return await fetchJson<ProductDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.product}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
