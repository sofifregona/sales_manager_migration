import { redirect } from "react-router-dom";
import { reactivateBrand } from "~/feature/brand/brand-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBrandReactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Marca");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  try {
    await reactivateBrand(idNum);
    setFlash({ scope: "brand", kind: "reactivated-success" });
    return redirect("/brand?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la marca seleccionada."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
