import { redirect } from "react-router-dom";
import { reactivateProduct } from "~/feature/product/product-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleProductReactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Producto");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);
  const strategyParam = formData.get("strategy");
  const strategy = strategyParam
    ? (String(strategyParam) as "reactivate-product" | "cancel")
    : undefined;
  try {
    await reactivateProduct(id, strategy);
    const p = new URLSearchParams(url.search);
    ["id", "conflict", "code", "elementId", "message"].forEach((k) => p.delete(k));
    p.set("reactivated", "1");
    return redirect(`/product?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar el producto seleccionado."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
