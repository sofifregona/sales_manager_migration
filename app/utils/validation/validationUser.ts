import { validateRangeLength, runValidations } from "./validationHelpers";

type ValidationError = { error: string; source: "client" | "server" };

// a-z, 0-9, permiten . _ - en el medio; sin duplicados consecutivos; 3–32
const USERNAME_RE = /^(?!.*[._-]{2})[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?$/;

export function validateUsernameFormat(
  username: string
): ValidationError | null {
  if (!USERNAME_RE.test(username)) {
    return {
      error:
        "(Error) Nombre de usuario: formato inválido. Solo se aceptan minúsculas, números y ._- ().",
      source: "client",
    };
  }
  return null;
}

// Password: caracteres ASCII imprimibles (sin tabs/saltos/control). Longitud se valida aparte.
export function validatePasswordFormat(
  password: string
): ValidationError | null {
  if (!/^[\x20-\x7E]+$/.test(password)) {
    return {
      error:
        "(Error) Contraseña: use caracteres imprimibles (sin tabs/saltos).",
      source: "client",
    };
  }
  return null;
}

export function validateUserRole(role: string): ValidationError | null {
  const allowed = new Set(["ADMIN", "MANAGER", "CASHIER"]);
  if (!allowed.has(role)) {
    return { error: "(Error) Rol inválido.", source: "client" };
  }
  return null;
}
