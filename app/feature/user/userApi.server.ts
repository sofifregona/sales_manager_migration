import { API_BASE_URL } from "~/config/api";
import { fetchJson } from "~/lib/http/fetchJson.server";
import type {
  ChangePersonalPasswordPayload,
  UserDTO,
  CreateUserPayload,
  UpdateUserPayload,
} from "~/feature/user/user";
import { ENDPOINTS } from "~/config/endpoints";

// Stubs for create/update/deactivate if needed by existing screens
export async function createUserAction(data: CreateUserPayload) {
  return await fetchJson<UserDTO>(`${API_BASE_URL}/${ENDPOINTS.user}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateUserAction(data: UpdateUserPayload) {
  const { id, ...rest } = data;
  return await fetchJson<UserDTO>(
    `${API_BASE_URL}/${ENDPOINTS.user}/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    }
  );
}

export async function deactivateUserAction(id: number) {
  return await fetchJson<UserDTO>(
    `${API_BASE_URL}/users/${id}/deactivate`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    }
  );
}
// Password flows
export async function changePersonalPasswordAction(
  data: ChangePersonalPasswordPayload
) {
  return await fetchJson(`${API_BASE_URL}/${ENDPOINTS.user}/me/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getAllUsers() {
  return await fetchJson<UserDTO[]>(`${API_BASE_URL}/${ENDPOINTS.user}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getUserById(id: number) {
  return await fetchJson<UserDTO>(
    `${API_BASE_URL}/${ENDPOINTS.user}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

