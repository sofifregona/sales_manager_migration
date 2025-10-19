import { redirect } from "react-router-dom";
import { reactivateAccountSwap } from "~/feature/account/account-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleReactivateSwapAccount({ formData }: Ctx) {
  const currentIdParam = formData.get("currentId");
  const currentIdReqError = validateRequiredId(currentIdParam, "Cuenta actual");
  if (currentIdReqError)
    return jsonResponse(422, currentIdReqError);
  const currentIdNum = Number(currentIdParam);

  const inactiveIdParam = formData.get("inactiveId");
  const inactiveIdReqError = validateRequiredId(
    inactiveIdParam,
    "Cuenta inactiva"
  );
  if (inactiveIdReqError)
    return jsonResponse(422, inactiveIdReqError);
  const inactiveIdNum = Number(inactiveIdParam);

  try {
    await reactivateAccountSwap(inactiveIdNum, currentIdNum);
    setFlash({ scope: "account", kind: "reactivated-success" });
    return redirect("/account?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la cuenta intercambiando los estados."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
