import { redirect } from "react-router-dom";
import { deactivateBartable } from "~/feature/bartable/bartable-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBartableDeactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Mesa");
  if (idReqError)
    return jsonResponse(422, {
      error: idReqError.error,
      source: idReqError.source,
    });
  const idNum = Number(idParam);

  try {
    await deactivateBartable(idNum);
    // Añadimos ambos: flag en URL y client-flash para coherencia con UI
    setFlash({ scope: "bartable", kind: "deleted-success" });
    return redirect("/bartable?deleted=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar la mesa seleccionada."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
