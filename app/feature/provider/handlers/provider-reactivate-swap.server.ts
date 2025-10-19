import { redirect } from "react-router-dom";
import { reactivateProviderSwap } from "~/feature/provider/providerApi.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleProviderReactivateSwap({ formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(currentIdParam, "Proveedor actual");
  if (currentIdReqError) return jsonResponse(422, currentIdReqError);
  const currentIdNum = Number(currentIdParam);

  const inactiveIdReqError = validateRequiredId(inactiveIdParam, "Proveedor inactivo");
  if (inactiveIdReqError) return jsonResponse(422, inactiveIdReqError);
  const inactiveIdNum = Number(inactiveIdParam);

  try {
    await reactivateProviderSwap(inactiveIdNum, currentIdNum);
    return redirect("/provider?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo reactivar el proveedor intercambiando los estados.");
    return jsonResponse(parsed.status ?? 500, { error: parsed.message, source: parsed.source ?? "server" });
  }
}
