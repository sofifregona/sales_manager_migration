import { API_BASE_URL } from "~/config/api";
import { fetchJson } from "~/lib/http/fetchJson.server";
import type {
  UserDTO,
  CreateUserPayload,
  UpdateUserPayload,
  ResetPasswordPayload,
} from "~/feature/user/user";
import { ENDPOINTS } from "~/config/endpoints";

// Stubs for create/update/deactivate if needed by existing screens
export async function createUser(data: CreateUserPayload) {
  const { username, name, password, role } = data;
  return await fetchJson<UserDTO>(`${API_BASE_URL}/${ENDPOINTS.user}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, name, password, role }),
  });
}

export async function updateUser(data: UpdateUserPayload) {
  const { id, username, name, role } = data;
  return await fetchJson<UserDTO>(`${API_BASE_URL}/${ENDPOINTS.user}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, name, role }),
  });
}

export async function resetUserPassword(data: ResetPasswordPayload) {
  const { id, password } = data;
  return await fetchJson<UserDTO>(`${API_BASE_URL}/${ENDPOINTS.user}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

export async function deactivateUser(id: number) {
  return await fetchJson<UserDTO>(
    `${API_BASE_URL}/${ENDPOINTS.user}/${id}/deactivate`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function reactivateUser(id: number) {
  return await fetchJson<UserDTO>(
    `${API_BASE_URL}/${ENDPOINTS.user}/${id}/reactivate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getAllUsers(includeInactive: boolean = false) {
  return await fetchJson<UserDTO[]>(
    `${API_BASE_URL}/${ENDPOINTS.user}${
      includeInactive ? `?includeInactive=1` : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getUserById(id: number) {
  return await fetchJson<UserDTO>(`${API_BASE_URL}/${ENDPOINTS.user}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
