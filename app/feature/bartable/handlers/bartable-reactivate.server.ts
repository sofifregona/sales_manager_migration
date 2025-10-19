import { redirect } from "react-router-dom";
import { reactivateBartable } from "~/feature/bartable/bartable-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBartableReactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Mesa");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const idNum = Number(idParam);

  try {
    await reactivateBartable(idNum);
    setFlash({ scope: "bartable", kind: "reactivated-success" });
    return redirect("/bartable?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la mesa seleccionada."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
