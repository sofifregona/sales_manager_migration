import type {
  PaymentDTO,
  CreatePaymentPayload,
  UpdatePaymentPayload,
} from "./payment";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createPayment(data: CreatePaymentPayload) {
  const { name, idAccount } = data;
  return await fetchJson<PaymentDTO>(
    `${API_BASE_URL}/${ENDPOINTS.payment}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, idAccount }),
    }
  );
}

// ACTUALIZAR MESA
export async function updatePayment(data: UpdatePaymentPayload) {
  const { id, name, idAccount } = data;
  return await fetchJson<PaymentDTO>(
    `${API_BASE_URL}/${ENDPOINTS.payment}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, idAccount }),
    }
  );
}

// ELIMINAR MESA
export async function deactivatePayment(id: number) {
  return await fetchJson<PaymentDTO>(
    `${API_BASE_URL}/${ENDPOINTS.payment}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: false }),
    }
  );
}

export async function reactivatePayment(id: number) {
  return await fetchJson<PaymentDTO>(
    `${API_BASE_URL}/${ENDPOINTS.payment}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function reactivatePaymentSwap(
  inactiveId: number,
  currentId: number
) {
  return await fetchJson<PaymentDTO>(
    `${API_BASE_URL}/${ENDPOINTS.payment}/reactivate-swap`,
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

export async function getAllPayments(
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
  const url = `${API_BASE_URL}/${ENDPOINTS.payment}${qs ? `?${qs}` : ""}`;
  return await fetchJson<PaymentDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getPaymentById(id: number) {
  return await fetchJson<PaymentDTO>(
    `${API_BASE_URL}/${ENDPOINTS.payment}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

