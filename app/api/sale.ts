import type {
  SaleDTO,
  CreateSalePayload,
  UpdateSalePayload,
} from "~/types/sale";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createSale(data: CreateSalePayload) {
  const { idBartable, idEmployee } = data;

  return await fetchJson<SaleDTO>(`${VITE_API_URL}/api/${ENDPOINTS.sale}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idBartable, idEmployee }),
  });
}

// ACTUALIZAR MESA
export async function updateSale(data: UpdateSalePayload) {
  const { id, product, idPayment, open } = data;
  return await fetchJson<SaleDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.sale}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product,
        idPayment,
        open,
      }),
    }
  );
}

// ELIMINAR MESA
export async function deleteSale(id: number) {
  return await fetchJson<SaleDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.sale}/${id}`,
    {
      method: "DELETE",
    }
  );
}

// TRAER TODAS LAS MESAS
export async function getAllSales() {
  return await fetchJson<SaleDTO[]>(`${VITE_API_URL}/api/${ENDPOINTS.sale}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getSaleById(id: number) {
  return await fetchJson<SaleDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.sale}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
