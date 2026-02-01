import { redirect } from "react-router-dom";
import { deactivateProduct } from "../product-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleProductDeactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Producto");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  try {
    await deactivateProduct(id);

    const p = new URLSearchParams(url.search);
    ["id", "conflict", "code", "elementId", "message"].forEach((k) => p.delete(k));
    p.set("deactivated", "1");
    return redirect(`/settings/product?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar el producto seleccionado."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
