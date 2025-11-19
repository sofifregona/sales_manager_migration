import { AppError } from "../../errors/AppError.js";
import { isRole, type Role } from "../../constants/roles.js";

// a-z, 0-9; permite . _ - en el medio; sin duplicados consecutivos;
// no puede iniciar/terminar con . _ -; (la longitud se valida aparte)
export const USERNAME_RE = /^(?!.*[._-]{2})[a-z0-9][a-z0-9._-]*[a-z0-9]$/;

/**
 * Valida el formato del nombre de usuario (sin longitud).
 * - Solo minúsculas (sin tildes), números y . _ -
 * - No puede iniciar o terminar con . _ -
 * - No puede contener dos caracteres especiales seguidos
 * - Sin espacios
 */
export function validateUsernameFormat(username: string, label = "Nombre de usuario") {
  if (!USERNAME_RE.test(String(username))) {
    throw new AppError(
      `(Error) ${label} inválido. Solo minúsculas (sin tildes), números y . _ -. ` +
        "No puede iniciar o terminar con . _ - ni contener dos seguidos. Sin espacios.",
      422
    );
  }
}

// Password: al menos 1 minúscula, 1 MAYÚSCULA, 1 dígito y 1 caracter especial; sin espacios.
// (La longitud se valida aparte)
export const PASSWORD_CHARS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]+$/;

export function validatePasswordCharacters(password: string, label = "Contraseña") {
  if (!PASSWORD_CHARS_RE.test(String(password))) {
    throw new AppError(
      `(Error) ${label} inválida. Debe incluir al menos una minúscula, una mayúscula, ` +
        "un número y un caracter especial; sin espacios.",
      422
    );
  }
}

/**
 * Normaliza y valida un rol. Devuelve el Role válido o lanza AppError.
 */
export function parseUserRole(role: string, label = "Rol"): Role {
  const v = String(role).trim().toUpperCase();
  if (!isRole(v)) {
    throw new AppError(
      `(Error) ${label} inválido. Valores permitidos: ADMIN, MANAGER, CASHIER.`,
      422,
      "VALIDATION_ROLE"
    );
  }
  return v as Role;
}

