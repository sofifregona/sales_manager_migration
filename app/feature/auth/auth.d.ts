import type { Role } from "~/shared/constants/roles";

// DTO devuelto por el backend al consultar la sesión actual (/auth/me) o tras login
export interface AuthUserDTO {
  id: number;
  username: string;
  role: Role;
}

// Datos que expone el loader de auth (root/private)
export interface AuthLoaderData {
  user: AuthUserDTO | null;
}

// Payloads de autenticación
export interface LoginPayload {
  username: string;
  password: string;
}

// Respuesta de action de login
// Las actions suelen devolver errores ad-hoc ({ error, source })
// Tipalos localmente en cada ruta si hace falta.
