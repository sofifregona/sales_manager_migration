import { redirect } from "react-router-dom";
import { reactivateAccount } from "~/feature/account/account-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleReactivateAccount({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Cuenta");
  if (idReqError) return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  try {
    await reactivateAccount(idNum);
    // setFlash({ scope: "account", kind: "reactivated-success" });
    // const params = new URLSearchParams(url.search);
    // console.log("DENTRO DEL REACTIVATE");
    // params.set("reactivated", "1");
    // ["conflict", "code", "message", "name", "description", "elementId"].forEach(
    //   (k) => params.delete(k)
    // );
    // params.delete("id");
    // return redirect(`/account?${params.toString()}`);
    const out = new URLSearchParams();
    out.set("reactivated", "1");
    if (url.searchParams.get("includeInactive") === "1")
      out.set("includeInactive", "1");
    return redirect(`/account?${out.toString()}`);
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
