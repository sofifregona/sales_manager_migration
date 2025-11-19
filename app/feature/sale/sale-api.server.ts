import type {
  SaleDTO,
  CreateSalePayload,
  UpdateSalePayload,
  TotalSalesDTO,
  GroupedSaleDTO,
  CloseSalePayload,
} from "~/feature/sale/types/sale";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createSale(data: CreateSalePayload) {
  const { idBartable, idEmployee } = data;

  return await fetchJson<SaleDTO>(`${API_BASE_URL}/${ENDPOINTS.sale}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idBartable, idEmployee }),
  });
}

// ACTUALIZAR MESA
export async function updateSale(data: UpdateSalePayload) {
  const { id, product } = data;
  return await fetchJson<SaleDTO>(`${API_BASE_URL}/${ENDPOINTS.sale}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product,
    }),
  });
}

export async function closeSale(data: CloseSalePayload) {
  const { id, idPayment } = data;
  return await fetchJson<SaleDTO>(
    `${API_BASE_URL}/${ENDPOINTS.sale}/${id}/close`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idPayment,
      }),
    }
  );
}

// ELIMINAR MESA
export async function deleteSale(id: number) {
  return await fetchJson<SaleDTO>(`${API_BASE_URL}/${ENDPOINTS.sale}/${id}`, {
    method: "DELETE",
  });
}

// TRAER TODAS LAS MESAS
export async function getAllSales() {
  return await fetchJson<SaleDTO[]>(`${API_BASE_URL}/${ENDPOINTS.sale}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getListOfSales(filter: {
  startedDate: string;
  finalDate: string;
  groupBy: string;
}): Promise<SaleDTO[] | GroupedSaleDTO[]> {
  console.log("DENTRO DE LA API");
  const qs = new URLSearchParams();
  qs.set("startedDate", String(filter.startedDate));
  qs.set("finalDate", String(filter.finalDate));
  qs.set("groupBy", filter.groupBy);

  const url = `${API_BASE_URL}/${ENDPOINTS.sale}/filter${
    qs.toString() ? `?${qs}` : ""
  }`;

  console.log(url);
  if (filter.groupBy === "sale") {
    return await fetchJson<SaleDTO[]>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return await fetchJson<GroupedSaleDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getSaleById(id: number) {
  return await fetchJson<SaleDTO>(`${API_BASE_URL}/${ENDPOINTS.sale}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
