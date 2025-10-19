import { redirect } from "react-router-dom";
import { reactivateAccount } from "~/feature/account/account-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleReactivateAccount({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Cuenta");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const idNum = Number(idParam);

  try {
    await reactivateAccount(idNum);
    setFlash({ scope: "account", kind: "reactivated-success" });
    return redirect("/account?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la cuenta seleccionada."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
