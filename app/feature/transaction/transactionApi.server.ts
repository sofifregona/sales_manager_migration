import type {
  TransactionDTO,
  CreateMovementPayload,
  UpdateMovementPayload,
} from "~/feature/transaction/transaction";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

// CREAR MESA
export async function createTransaction(data: CreateMovementPayload) {
  const { idAccount, type, amount, description } = data;
  return await fetchJson<TransactionDTO>(
    `${API_BASE_URL}/${ENDPOINTS.transaction}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idAccount, type, amount, description }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateTransaction(data: UpdateMovementPayload) {
  const { id, idAccount, type, amount, description } = data;
  return await fetchJson<TransactionDTO>(
    `${API_BASE_URL}/${ENDPOINTS.transaction}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idAccount, type, amount, description }),
    }
  );
}

// ELIMINAR MESA
export async function deactivateTransaction(id: number) {
  return await fetchJson<TransactionDTO>(
    `${API_BASE_URL}/${ENDPOINTS.transaction}/${id}/deactivate`,
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
export async function getListOfTransactions(filter: {
  startedDate?: string;
  finalDate?: string;
}) {
  const qs = new URLSearchParams();
  if (filter.startedDate !== undefined)
    qs.set("startedDate", String(filter.startedDate));
  if (filter.finalDate !== undefined)
    qs.set("finalDate", String(filter.finalDate));
  console.log(
    `${API_BASE_URL}/${ENDPOINTS.transaction}${
      qs.toString() ? `?${qs}` : ""
    }`
  );
  return await fetchJson<TransactionDTO[]>(
    `${API_BASE_URL}/${ENDPOINTS.transaction}${
      qs.toString() ? `?${qs}` : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getTransactionById(id: number) {
  return await fetchJson<TransactionDTO>(
    `${API_BASE_URL}/${ENDPOINTS.transaction}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

