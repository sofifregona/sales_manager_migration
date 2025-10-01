import type {
  PaymentDTO,
  CreatePaymentPayload,
  UpdatePaymentPayload,
} from "~/types/payment";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createPayment(data: CreatePaymentPayload) {
  const { name } = data;
  return await fetchJson<PaymentDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.payment}`,
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
export async function updatePayment(data: UpdatePaymentPayload) {
  const { id, name } = data;
  return await fetchJson<PaymentDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.payment}/${id}`,
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
export async function deactivatePayment(id: number) {
  return await fetchJson<PaymentDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.payment}/${id}/deactivate`,
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
export async function getAllPayments() {
  return await fetchJson<PaymentDTO[]>(
    `${VITE_API_URL}/api/${ENDPOINTS.payment}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getPaymentById(id: number) {
  return await fetchJson<PaymentDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.payment}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
