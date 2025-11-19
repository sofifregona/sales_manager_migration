import { redirect } from "react-router-dom";
import { updateBartable } from "~/feature/bartable/bartable-api.server";
import type { UpdateBartablePayload } from "~/feature/bartable/bartable";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { makeConflictCookie } from "~/services/conflictCookie";
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
  if (numParamError) return jsonResponse(422, numParamError);
  const num = Number(numParam);
  const numError = validatePositiveInteger(num, "NÃºmero");
  if (numError) return jsonResponse(422, numError);

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Mesa");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const updatedData: UpdateBartablePayload = { id, number: num };
  try {
    await updateBartable(updatedData);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("updated", "1");
    return redirect(`/bartable?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar la mesa seleccionada."
    );

    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "BARTABLE_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "update");
        p.set("message", parsed.message);

        const existingId = anyParsed?.details?.existingId as number | undefined;

        if (existingId != null) p.set("elementId", String(existingId));

        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          makeConflictCookie({ scope: "bartable", number: num })
        );
        return redirect(`/bartable?${p.toString()}` as any, { headers } as any);
      } else {
        return jsonResponse(409, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
