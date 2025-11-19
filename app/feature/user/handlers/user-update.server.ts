import { redirect } from "react-router-dom";
import { updateUser } from "../user-api.server";
import type { UpdateUserPayload } from "~/feature/user/user";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRangeLength,
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";
import {
  validateUsernameFormat,
  parseUserRole,
} from "~/utils/validation/validationUser";
import type { Role } from "~/shared/constants/roles";

type Ctx = { url: URL; formData: FormData };

export async function handleUserUpdate({ url, formData }: Ctx) {
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

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Usuario");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const updatedData: UpdateUserPayload = {
    id,
    username,
    name,
    role: role as Role,
  };

  try {
    await updateUser(updatedData);
    const p = new URLSearchParams(url.search);
    p.set("updated", "1");
    return redirect(`/user?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar el usuario."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}

