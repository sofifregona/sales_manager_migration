import { redirect } from "react-router-dom";
import { reactivateAccount } from "~/feature/account/account-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleReactivateAccount({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Cuenta");
  if (idReqError) return jsonResponse(422, idReqError);

  const idNum = Number(idParam);
  try {
    await reactivateAccount(idNum);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("reactivated", "1");
    return redirect(`/account?${p.toString()}`);
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
