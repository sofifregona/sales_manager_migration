import type {
  ProductDTO,
  CreateProductPayload,
  UpdateProductPayload,
  IncrementPricePayload,
} from "./product";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";
import {
  buildProductFormData,
  type ProductImageOptions,
} from "./ui/utils/buildProductFormData";

// CREAR PRODUCTO
export async function createProduct(
  data: CreateProductPayload,
  image?: ProductImageOptions
) {
  const body = buildProductFormData(data, image);
  return await fetchJson<ProductDTO>(`${API_BASE_URL}/${ENDPOINTS.product}`, {
    method: "POST",
    body,
  });
}

// ACTUALIZAR PRODUCTO
export async function updateProduct(
  data: UpdateProductPayload,
  image?: ProductImageOptions
) {
  const { id } = data;
  const body = buildProductFormData(data, image);
  return await fetchJson<ProductDTO>(
    `${API_BASE_URL}/${ENDPOINTS.product}/${id}`,
    {
      method: "PATCH",
      body,
    }
  );
}

export async function incrementProduct(data: IncrementPricePayload) {
  const { ids, percent } = data;
  return await fetchJson<ProductDTO[]>(
    `${API_BASE_URL}/${ENDPOINTS.product}/increment`,
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
    `${API_BASE_URL}/${ENDPOINTS.product}/${id}/deactivate`,
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
  qs.set("sortDirection", String(filters.sortDirection ?? "asc"));
  return await fetchJson<ProductDTO[]>(
    `${API_BASE_URL}/${ENDPOINTS.product}${qs.toString() ? `?${qs}` : ""}`,
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
    `${API_BASE_URL}/${ENDPOINTS.product}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
