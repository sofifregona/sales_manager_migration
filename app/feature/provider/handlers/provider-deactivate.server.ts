import { redirect } from "react-router-dom";
import { deactivateProvider } from "~/feature/provider/provider-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleProviderDeactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Proveedor");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  const strategy = formData.get("strategy")
    ? (String(formData.get("strategy")) as
        | "clear-products-provider"
        | "cascade-deactivate-products"
        | "cancel")
    : undefined;
  try {
    await deactivateProvider(idNum, strategy);
    const p = new URLSearchParams(url.search);
    p.set("deactivated", "1");
    return redirect(`/settings/provider?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar el proveedor seleccionado."
    );
    if (parsed.status === 409 && (parsed as any).code === "PROVIDER_IN_USE") {
      return jsonResponse(409, {
        error: parsed.message,
        code: (parsed as any).code,
        details: (parsed as any).details,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
