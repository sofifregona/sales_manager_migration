import { redirect } from "react-router-dom";
import { createUserAction } from "../user-api.server";
import type { CreateUserPayload } from "~/feature/user/user";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRangeLength,
  validateRequired,
  validateType,
} from "~/utils/validation/validationHelpers";
import {
  validatePasswordFormat,
  validateUsernameFormat,
  validateUserRole,
} from "~/utils/validation/validationUser";

type Ctx = { formData: FormData };

export async function handleUserCreate({ formData }: Ctx) {
  const usernameParam = formData.get("username");
  const usernameParamError = validateRequired(
    usernameParam,
    "string",
    "Nombre de usuario"
  );
  if (usernameParamError)
    return jsonResponse(422, usernameParamError);
  const username = (usernameParam as String).toLowerCase().replace(/\s+/g, "");
  const usernameLengthError = validateRangeLength(
    username,
    3,
    32,
    "Nombre de usuario"
  );
  if (usernameLengthError)
    return jsonResponse(422, usernameLengthError);
  const usernameFormatError = validateUsernameFormat(username);
  if (usernameFormatError) {
    return jsonResponse(422, usernameFormatError);
  }

  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, nameParamError);
  const name = (nameParam as string).replace(/\s+/g, " ").trim();
  const nameLengthError = validateRangeLength(name, 3, 80, "Nombre");
  if (nameLengthError)
    return jsonResponse(422, nameLengthError);

  const passwordParam = formData.get("password");
  const passwordParamError = validateRequired(
    passwordParam,
    "string",
    "Contraseña"
  );
  if (passwordParamError)
    return jsonResponse(422, passwordParamError);
  const password = passwordParam as string;
  const passwordLengthError = validateRangeLength(
    password,
    8,
    128,
    "Contraseña"
  );
  if (passwordLengthError)
    return jsonResponse(422, passwordLengthError);
  const passwordFormatError = validatePasswordFormat(password);
  if (passwordFormatError) {
    return jsonResponse(422, passwordFormatError);
  }

  const roleParam = formData.get("role");
  const roleParamError = validateRequired(roleParam, "string", "Rol");
  if (roleParamError) {
    return jsonResponse(422, roleParamError);
  }

  const role = (roleParam as string).replace(/\s+/g, " ").trim().toUpperCase();
  const roleError = validateUserRole(role);
  if (roleError) {
    return jsonResponse(422, roleError);
  }

  const newData: CreateUserPayload = {
    username,
    name,
    password,
    role: role as CreateUserPayload["role"],
  };

  try {
    await createUserAction(newData);
    setFlash({ scope: "user", kind: "created-success" });
    return redirect("/user?created=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear el usuario.");
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "user",
        kind: "create-conflict",
        message: parsed.message,
      });
      return redirect("/user");
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
