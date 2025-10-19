import { redirect } from "react-router-dom";
import { deactivateProvider } from "~/feature/provider/provider-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleProviderDeactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Proveedor");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  try {
    await deactivateProvider(idNum);
    return redirect("/provider?deleted=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar el proveedor seleccionado."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
