import { redirect } from "react-router-dom";
import { reactivateCategorySwap } from "../category-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleCategoryReactivateSwap({ url, formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(
    currentIdParam,
    "Categoría actual"
  );
  if (currentIdReqError) return jsonResponse(422, currentIdReqError);

  const inactiveId = Number(inactiveIdParam);
  const currentId = Number(currentIdParam);
  const strategy = formData.get("strategy")
    ? (String(formData.get("strategy")) as
        | "clear-products-category"
        | "cascade-deactivate-products"
        | "cancel")
    : undefined;

  try {
    await reactivateCategorySwap(inactiveId, currentId, strategy);
    const p = new URLSearchParams();
    p.set("reactivated", "1");
    return redirect(`/category?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la categoría intercambiando los estados."
    );
    const status = parsed.status ?? 500;
    if (status === 409) {
      return jsonResponse(409, {
        error: parsed.message,
        source: parsed.source ?? "server",
        code: (parsed as any).code,
        details: (parsed as any).details,
      });
    }
    return jsonResponse(status, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
