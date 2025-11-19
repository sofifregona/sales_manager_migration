import { redirect } from "react-router-dom";
import { deactivateBrand } from "~/feature/brand/brand-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBrandDeactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Marca");
  if (idReqError) return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  const strategy = formData.get("strategy")
    ? (String(formData.get("strategy")) as
        | "clear-products-brand"
        | "cascade-deactivate-products"
        | "cancel")
    : undefined;

  try {
    await deactivateBrand(idNum, strategy);
    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("deactivated", "1");
    return redirect(`/brand?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar la marca seleccionada."
    );
    if (parsed.status === 409 && (parsed as any).code === "BRAND_IN_USE") {
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
