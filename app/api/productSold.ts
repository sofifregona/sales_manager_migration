import type {
  ProductSoldDTO,
  CreateProductSoldPayload,
  UpdateProductSoldPayload,
} from "~/types/productSold";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createProductSold(data: CreateProductSoldPayload) {
  const { idProduct, quantity, subtotal, idSale } = data;
  return await fetchJson<ProductSoldDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.productSold}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idProduct,
        quantity,
        subtotal,
        idSale,
      }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateProductSold(data: UpdateProductSoldPayload) {
  const { id, quantity, subtotal } = data;
  return await fetchJson<ProductSoldDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.productSold}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
        subtotal,
      }),
    }
  );
}

// ELIMINAR MESA
export async function deleteProductSold(id: number) {
  return await fetchJson<ProductSoldDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.productSold}/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function getProductSoldById(id: number) {
  return await fetchJson<ProductSoldDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.productSold}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
