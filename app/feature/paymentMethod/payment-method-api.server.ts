import type {
  PaymentMethodDTO,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
} from "./payment-method";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createPaymentMethod(data: CreatePaymentMethodPayload) {
  const { name, idAccount } = data;
  return await fetchJson<PaymentMethodDTO>(
    `${API_BASE_URL}/${ENDPOINTS.paymentMethod}`,
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
export async function updatePaymentMethod(data: UpdatePaymentMethodPayload) {
  const { id, name, idAccount } = data;
  return await fetchJson<PaymentMethodDTO>(
    `${API_BASE_URL}/${ENDPOINTS.paymentMethod}/${id}`,
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
export async function deactivatePaymentMethod(id: number) {
  return await fetchJson<PaymentMethodDTO>(
    `${API_BASE_URL}/${ENDPOINTS.paymentMethod}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function reactivatePaymentMethod(
  id: number,
  strategy?: "reactivate-account" | "cancel"
) {
  return await fetchJson<PaymentMethodDTO>(
    `${API_BASE_URL}/${ENDPOINTS.paymentMethod}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: strategy ? JSON.stringify({ strategy }) : undefined,
    }
  );
}

export async function reactivatePaymentMethodSwap(
  inactiveId: number,
  currentId: number,
  strategy?: "reactivate-account" | "cancel"
) {
  return await fetchJson<PaymentMethodDTO>(
    `${API_BASE_URL}/${ENDPOINTS.paymentMethod}/${inactiveId}/reactivate-swap`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strategy ? { currentId, strategy } : { currentId }),
    }
  );
}

export async function getAllPaymentMethods(includeInactive: boolean = false) {
  const url = `${API_BASE_URL}/${ENDPOINTS.paymentMethod}${
    includeInactive ? `?includeInactive=1` : ""
  }`;
  return await fetchJson<PaymentMethodDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getPaymentMethodById(id: number) {
  return await fetchJson<PaymentMethodDTO>(
    `${API_BASE_URL}/${ENDPOINTS.paymentMethod}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
