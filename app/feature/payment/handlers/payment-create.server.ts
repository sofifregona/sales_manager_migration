import { redirect } from "react-router-dom";
import { createPayment } from "~/feature/payment/payment-api.server";
import type { CreatePaymentPayload } from "~/feature/payment/payment";
import { jsonResponse } from "~/lib/http/jsonResponse";
// import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";
import { makeConflictCookie } from "~/services/conflictCookie";

type Ctx = { url: URL; formData: FormData };

export async function handlePaymentCreate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameErr = validateRequired(nameParam, "string", "Nombre");
  if (nameErr) return jsonResponse(422, nameErr);
  const name = (nameParam as string).trim();

  const idAccountParam = formData.get("idAccount");
  const idAccountReq = validateRequired(idAccountParam, "string", "Cuenta");
  if (idAccountReq) return jsonResponse(422, idAccountReq);
  const idAccount = Number((idAccountParam as string).trim());
  const idAccErr = validateRequiredId(String(idAccount), "Cuenta"); // req + num
  if (idAccErr) return jsonResponse(422, idAccErr);

  // debug log removed

  const payload: CreatePaymentPayload = { name, idAccount };
  try {
    await createPayment(payload);
    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("created", "1");
    return redirect(`/payment?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo crear el mÃ©todo de pago."
    );
    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "PAYMENT_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const existingId = anyParsed?.details?.existingId as number | undefined;

        const p = new URLSearchParams(url.search);
        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "create");
        if (existingId != null) p.set("elementId", String(existingId));

        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          makeConflictCookie({ scope: "payment", name, idAccount })
        );
        return redirect(`/payment?${p.toString()}` as any, { headers } as any);
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

