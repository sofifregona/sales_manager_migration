import { redirect } from "react-router-dom";
import { updateBartable } from "~/feature/bartable/bartable-api.server";
import type { UpdateBartablePayload } from "~/feature/bartable/bartable";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validatePositiveInteger,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBartableUpdate({ url, formData }: Ctx) {
  const numParam = formData.get("number");
  const numParamError = validateRequired(numParam, "string", "NÃºmero");
  if (numParamError)
    return jsonResponse(422, numParamError);
  const num = Number(numParam);
  const numError = validatePositiveInteger(num, "NÃºmero");
  if (numError)
    return jsonResponse(422, numError);

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Mesa");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const updatedData: UpdateBartablePayload = { id, number: num };
  try {
    await updateBartable(updatedData);
    setFlash({ scope: "bartable", kind: "updated-success" });
    return redirect("/bartable?updated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar la mesa seleccionada."
    );
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "bartable",
        kind: "update-conflict",
        message: parsed.message,
        number: num,
        elementId:
          anyParsed.code === "BARTABLE_EXISTS_INACTIVE" && anyParsed.details
            ? anyParsed.details.existingId
            : undefined,
      } as any);
      return redirect("/bartable");
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
