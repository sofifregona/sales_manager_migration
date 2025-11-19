import { isRole, type Role } from "~/shared/constants/roles";

type ValidationError = { error: string; source: "client" | "server" };

// a-z, 0-9, permiten . _ - en el medio; sin duplicados consecutivos; 3–32
const USERNAME_RE = /^(?!.*[._-]{2})(?=.{5,32}$)[a-z0-9](?:[a-z0-9._-]*[a-z0-9])$/;

export function validateUsernameFormat(
  username: string
): ValidationError | null {
  if (!USERNAME_RE.test(username)) {
    return {
      error:
        "(Error) Nombre de usuario inválido. Solo se aceptan minúsculas (sin tildes), números y . _ -. " +
        "No puede iniciar o terminar con . _ - ni contener dos de estos símbolos seguidos. No se aceptan espacios.",
      source: "client",
    };
  }
  return null;
}

export const PASSWORD_CHARS_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]+$/;

// Password: caracteres ASCII imprimibles (sin tabs/saltos/control). Longitud se valida aparte.
export function validatePasswordFormat(
  password: string
): ValidationError | null {
  if (!PASSWORD_CHARS_RE.test(password)) {
    return {
      error:
        "(Error) Contraseña inválida. Debe incluir al menos una minúscula, una mayúscula, un número y un caracter especial; sin espacios.",
      source: "client",
    };
  }
  return null;
}

export function parseUserRole(
  role: string
): { ok: true; value: Role } | { ok: false; error: ValidationError } {
  const v = String(role).trim().toUpperCase();
  if (!isRole(v)) {
    return {
      ok: false,
      error: {
        error:
          "(Error) Rol inválido. Valores permitidos: ADMIN, MANAGER, CASHIER.",
        source: "client",
      },
    };
  }
  return { ok: true, value: v as Role };
}

