import { redirect } from "react-router-dom";
import { deactivateBrand } from "~/feature/brand/brand-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBrandDeactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Marca");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const idNum = Number(idParam);

  try {
    const strategy = formData.get("strategy")
      ? (String(formData.get("strategy")) as
          | "clear-products-brand"
          | "deactivate-products"
          | "cancel")
      : undefined;
    await deactivateBrand(idNum, strategy);
    setFlash({ scope: "brand", kind: "deleted-success" });
    return redirect("/brand?deleted=1");
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
