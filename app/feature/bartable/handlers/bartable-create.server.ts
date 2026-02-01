import { redirect } from "react-router-dom";
import { createBartable } from "~/feature/bartable/bartable-api.server";
import type { CreateBartablePayload } from "~/feature/bartable/bartable";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { makeConflictCookie } from "~/services/conflictCookie";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validatePositiveInteger,
  validateRequiredAndType,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBartableCreate({ url, formData }: Ctx) {
  const numParam = formData.get("number");
  const numParamError = validateRequiredAndType(numParam, "number", "Número");
  if (numParamError) return jsonResponse(422, numParamError);

  const num = Number(numParam);
  const numError = validatePositiveInteger(num, "Número");
  if (numError) return jsonResponse(422, numError);

  const newData: CreateBartablePayload = { number: num };

  try {
    await createBartable(newData);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("created", "1");
    return redirect(`/settings/bartable?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear la mesa.");
    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "BARTABLE_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "create");

        const existingId = anyParsed?.details?.existingId as number | undefined;
        if (existingId != null) p.set("elementId", String(existingId));

        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          makeConflictCookie({ scope: "bartable", number: num })
        );

        return redirect(
          `/settings/bartable?${p.toString()}` as any,
          {
            headers,
          } as any
        );
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
