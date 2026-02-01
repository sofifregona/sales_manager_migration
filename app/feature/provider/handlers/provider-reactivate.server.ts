import { redirect } from "react-router-dom";
import { reactivateProvider } from "~/feature/provider/provider-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleProviderReactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Proveedor");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  try {
    await reactivateProvider(idNum);
    const p = new URLSearchParams(url.search);
    p.set("reactivated", "1");
    return redirect(`/settings/provider?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar el proveedor seleccionado."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
