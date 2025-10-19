import { redirect } from "react-router-dom";
import { reactivateBrandSwap } from "~/feature/brand/brand-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBrandReactivateSwap({ formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(currentIdParam, "Marca actual");
  if (currentIdReqError)
    return jsonResponse(422, currentIdReqError);
  const currentIdNum = Number(currentIdParam);

  const inactiveIdReqError = validateRequiredId(
    inactiveIdParam,
    "Marca inactiva"
  );
  if (inactiveIdReqError)
    return jsonResponse(422, inactiveIdReqError);
  const inactiveIdNum = Number(inactiveIdParam);

  try {
    await reactivateBrandSwap(inactiveIdNum, currentIdNum);
    setFlash({ scope: "brand", kind: "reactivated-success" });
    return redirect("/brand?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la marca intercambiando los estados."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
