import type {
  AccountDTO,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "~/types/account";
import { VITE_API_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/utils/api/fetchJson";

// CREAR MESA
export async function createAccount(data: CreateAccountPayload) {
  const { name, description } = data;
  return await fetchJson<AccountDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.account}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    }
  );
}

// ACTUALIZAR MESA
export async function updateAccount(data: UpdateAccountPayload) {
  const { id, name, description } = data;
  return await fetchJson<AccountDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.account}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    }
  );
}

// ELIMINAR MESA
export async function deactivateAccount(id: number) {
  return await fetchJson<AccountDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.account}/${id}/deactivate`,
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
export async function getAllAccounts() {
  return await fetchJson<AccountDTO[]>(
    `${VITE_API_URL}/api/${ENDPOINTS.account}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getAccountById(id: number) {
  return await fetchJson<AccountDTO>(
    `${VITE_API_URL}/api/${ENDPOINTS.account}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
