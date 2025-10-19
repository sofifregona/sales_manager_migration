import { redirect } from "react-router-dom";
import { createBartable } from "~/feature/bartable/bartable-api.server";
import type { CreateBartablePayload } from "~/feature/bartable/bartable";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validatePositiveInteger,
} from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBartableCreate({ formData }: Ctx) {
  const numParam = formData.get("number");
  const numParamError = validateRequired(numParam, "number", "NÃºmero");
  if (numParamError)
    return jsonResponse(422, numParamError);
  const num = Number(numParam);
  const numError = validatePositiveInteger(num, "NÃºmero");
  if (numError)
    return jsonResponse(422, numError);

  const newData: CreateBartablePayload = { number: num };
  try {
    await createBartable(newData);
    setFlash({ scope: "bartable", kind: "created-success" });
    return redirect("/bartable?created=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear la mesa.");
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "bartable",
        kind: "create-conflict",
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
