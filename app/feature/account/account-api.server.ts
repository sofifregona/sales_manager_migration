import type {
  AccountDTO,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "~/feature/account/account";
import { API_BASE_URL } from "~/config/api";
import { ENDPOINTS } from "~/config/endpoints";
import { fetchJson } from "~/lib/http/fetchJson.server";

export async function createAccount(data: CreateAccountPayload) {
  const { name, description } = data;
  return await fetchJson<AccountDTO>(`${API_BASE_URL}/${ENDPOINTS.account}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });
}

export async function updateAccount(data: UpdateAccountPayload) {
  const { id, name, description } = data;
  return await fetchJson<AccountDTO>(
    `${API_BASE_URL}/${ENDPOINTS.account}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    }
  );
}

export async function deactivateAccount(
  id: number,
  strategy?: "cascade-delete-payments" | "cancel"
) {
  return await fetchJson<AccountDTO>(
    `${API_BASE_URL}/${ENDPOINTS.account}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strategy ? { strategy } : {}),
    }
  );
}

export async function reactivateAccount(id: number) {
  return await fetchJson<AccountDTO>(
    `${API_BASE_URL}/${ENDPOINTS.account}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function reactivateAccountSwap(
  inactiveId: number,
  currentId: number,
  strategy?: "cascade-delete-payments" | "cancel"
) {
  return await fetchJson<AccountDTO>(
    `${API_BASE_URL}/${ENDPOINTS.account}/${inactiveId}/reactivate-swap`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strategy ? { currentId, strategy } : { currentId }),
    }
  );
}

export async function getAllAccounts(includeInactive: boolean = false) {
  const url = `${API_BASE_URL}/${ENDPOINTS.account}${
    includeInactive ? `?includeInactive=1` : ""
  }`;
  return await fetchJson<AccountDTO[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getAccountById(id: number) {
  return await fetchJson<AccountDTO>(
    `${API_BASE_URL}/${ENDPOINTS.account}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}
