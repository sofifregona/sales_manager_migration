import { redirect } from "react-router-dom";
import { reactivateCategory } from "~/feature/category/category-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleCategoryReactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Categoría");
  if (idReqError)
    return jsonResponse(422, {
      error: idReqError.error,
      source: idReqError.source,
    });
  const idNum = Number(idParam);
  try {
    await reactivateCategory(idNum);
    setFlash({ scope: "category", kind: "reactivated-success" });
    return redirect("/category?reactivated=1");
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
