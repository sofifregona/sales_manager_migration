import { redirect } from "react-router-dom";
import { updatePayment } from "~/feature/payment/payment-api.server";
import type { UpdatePaymentPayload } from "~/feature/payment/payment";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequired, validateRequiredId } from "~/utils/validation/validationHelpers";
import { makeConflictCookie } from "~/services/conflictCookie";

type Ctx = { url: URL; formData: FormData };

export async function handlePaymentUpdate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameErr = validateRequired(nameParam, "string", "Nombre");
  if (nameErr) return jsonResponse(422, nameErr);
  const name = (nameParam as string).trim();

  const idAccountParam = formData.get("idAccount");
  const idAccountReq = validateRequired(idAccountParam, "string", "Cuenta");
  if (idAccountReq) return jsonResponse(422, idAccountReq);
  const idAccount = Number((idAccountParam as string).trim());
  const idAccErr = validateRequiredId(String(idAccount), "Cuenta");
  if (idAccErr) return jsonResponse(422, idAccErr);

  const idParam = url.searchParams.get("id");
  const idReqErr = validateRequiredId(idParam, "Método de pago");
  if (idReqErr) return jsonResponse(422, idReqErr);
  const id = Number(idParam);

  const payload: UpdatePaymentPayload = { id, idAccount, name };
  try {
    await updatePayment(payload);
    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("updated", "1");
    return redirect(`/payment?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar el método de pago seleccionado."
    );

    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "PAYMENT_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        p.set("conflict", "update");
        if (parsed.code) p.set("code", String(parsed.code));
        p.set("message", parsed.message);

        const existingId = anyParsed?.details?.existingId as number | undefined;
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
