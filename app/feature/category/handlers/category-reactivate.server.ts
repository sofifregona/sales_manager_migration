import { redirect } from "react-router-dom";
import { reactivateCategory } from "~/feature/category/category-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleCategoryReactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Categoría");
  if (idReqError) return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  try {
    await reactivateCategory(idNum);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("reactivated", "1");
    return redirect(`/category?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la categoría seleccionada."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
