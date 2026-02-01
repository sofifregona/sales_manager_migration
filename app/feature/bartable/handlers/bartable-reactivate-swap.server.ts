import { redirect } from "react-router-dom";
import { reactivateBartableSwap } from "~/feature/bartable/bartable-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBartableReactivateSwap({ url, formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(currentIdParam, "Mesa actual");
  if (currentIdReqError) return jsonResponse(422, currentIdReqError);
  const currentIdNum = Number(currentIdParam);

  const inactiveIdReqError = validateRequiredId(
    inactiveIdParam,
    "Mesa inactiva"
  );
  if (inactiveIdReqError) return jsonResponse(422, inactiveIdReqError);
  const inactiveIdNum = Number(inactiveIdParam);

  try {
    await reactivateBartableSwap(inactiveIdNum, currentIdNum);
    const p = new URLSearchParams();
    p.set("reactivated", "1");
    return redirect(`/settings/bartable?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la mesa intercambiando los estados."
    );
    const status = parsed.status ?? 500;
    // On 409, include code/details for UI overlay
    if (status === 409) {
      return jsonResponse(409, {
        error: parsed.message,
        source: parsed.source ?? "server",
        code: (parsed as any).code,
        details: (parsed as any).details,
      });
    }
    // Other errors
    return jsonResponse(status, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
