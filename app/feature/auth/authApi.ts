import { API_BASE_URL } from "~/config/api";
import { fetchJson } from "~/lib/http/fetchJson";
import type { AuthUserDTO } from "~/feature/auth/auth";

export async function login(
  username: string,
  password: string
): Promise<AuthUserDTO> {
  const login: any = await fetchJson(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return login;
}

export async function me(): Promise<AuthUserDTO> {
  const me: any = await fetchJson(`${API_BASE_URL}/auth/me`, {
    method: "GET",
  });
  return me;
}

export async function logout(): Promise<void> {
  await fetchJson(`${API_BASE_URL}/auth/logout`, { method: "POST" });
}

