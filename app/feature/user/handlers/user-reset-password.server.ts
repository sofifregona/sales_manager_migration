import { redirect } from "react-router-dom";
import { resetUserPassword } from "../user-api.server";
import type { ResetPasswordPayload } from "~/feature/user/user";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRangeLength,
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";
import { validatePasswordFormat } from "~/utils/validation/validationUser";

type Ctx = { url: URL; formData: FormData };

export async function handleResetUserPassword({ url, formData }: Ctx) {
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
      error: "(Error) Las Contraseñas deben coincidir.",
      source: "client",
    });
  }

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Usuario");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const data: ResetPasswordPayload = {
    id,
    password,
  };

  try {
    await resetUserPassword(data);
    const p = new URLSearchParams(url.search);
    p.set("reseted-password", "1");
    return redirect(`/user?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo resetear la contraseña del usuario."
    );
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
