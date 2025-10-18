import { redirect } from "react-router-dom";
import { reactivateBartableSwap } from "~/feature/bartable/bartable-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBartableReactivateSwap({ formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(currentIdParam, "Mesa actual");
  if (currentIdReqError)
    return jsonResponse(422, {
      error: currentIdReqError.error,
      source: currentIdReqError.source,
    });
  const currentIdNum = Number(currentIdParam);

  const inactiveIdReqError = validateRequiredId(
    inactiveIdParam,
    "Mesa inactiva"
  );
  if (inactiveIdReqError)
    return jsonResponse(422, {
      error: inactiveIdReqError.error,
      source: inactiveIdReqError.source,
    });
  const inactiveIdNum = Number(inactiveIdParam);

  try {
    await reactivateBartableSwap(inactiveIdNum, currentIdNum);
    setFlash({ scope: "bartable", kind: "reactivated-success" });
    return redirect("/bartable?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la mesa intercambiando los estados."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
