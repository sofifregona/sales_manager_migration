import { redirect } from "react-router-dom";
import { createUser } from "../user-api.server";
import type { CreateUserPayload } from "~/feature/user/user";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRangeLength,
  validateRequired
} from "~/utils/validation/validationHelpers";
import {
  validatePasswordFormat,
  validateUsernameFormat,
  parseUserRole,
} from "~/utils/validation/validationUser";
import type { Role } from "~/shared/constants/roles";

type Ctx = { url: URL; formData: FormData };

export async function handleUserCreate({ url, formData }: Ctx) {
  const usernameParam = formData.get("username");
  const usernameParamError = validateRequired(
    usernameParam,
    "string",
    "Nombre de usuario"
  );
  if (usernameParamError) return jsonResponse(422, usernameParamError);
  const username = (usernameParam as string).toLowerCase().replace(/\s+/g, "");
  const usernameLengthError = validateRangeLength(
    username,
    5,
    32,
    "Nombre de usuario"
  );
  if (usernameLengthError) return jsonResponse(422, usernameLengthError);
  const usernameFormatError = validateUsernameFormat(username);
  if (usernameFormatError) {
    return jsonResponse(422, usernameFormatError);
  }

  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);
  const name = (nameParam as string).trim();
  const nameLengthError = validateRangeLength(name, 5, 80, "Nombre");
  if (nameLengthError) return jsonResponse(422, nameLengthError);

  const passwordParam = formData.get("password");
  const passwordParamError = validateRequired(
    passwordParam,
    "string",
    "Contraseña"
  );
  if (passwordParamError) return jsonResponse(422, passwordParamError);
  const password = passwordParam as string;
  const passwordLengthError = validateRangeLength(
    password,
    8,
    80,
    "Contraseña"
  );
  if (passwordLengthError) return jsonResponse(422, passwordLengthError);
  const passwordFormatError = validatePasswordFormat(password);
  if (passwordFormatError) {
    return jsonResponse(422, passwordFormatError);
  }

  const repetedPassword = formData.get("repetedPassword");
  if (repetedPassword !== password) {
    return jsonResponse(422, {
      error: "(Error) Las contraseñas deben coincidir.",
      source: "client",
    });
  }

  const roleParam = formData.get("role");
  const roleParamError = validateRequired(roleParam, "string", "Rol");
  if (roleParamError) {
    return jsonResponse(422, roleParamError);
  }

  const role = (roleParam as string).replace(/\s+/g, " ").trim().toUpperCase();
  const roleError = parseUserRole(role);
  if (roleError) {
    return jsonResponse(422, roleError);
  }

  const newData: CreateUserPayload = {
    username,
    name,
    password,
    role: role as Role,
  };

  try {
    await createUser(newData);
    const p = new URLSearchParams(url.search);
    p.set("created", "1");
    return redirect(`/user?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear el usuario.");
    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "USER_EXISTS_INACTIVE") {
        return jsonResponse(409, {
          error:
            "Ya existe un usuario inactivo con este nombre de usuario. Para reactivarlo búsquelo en la tabla (click en 'Ver inactivos').",
          source: parsed.source ?? "server",
          code: parsed.code,
        });
      }
      return jsonResponse(409, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}

