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

  console.log(idAccountParam);

  const payload: CreatePaymentPayload = { name, idAccount };
  try {
    await createPayment(payload);
    const out = new URLSearchParams();
    if (url.searchParams.get("includeInactive") === "1")
      out.set("includeInactive", "1");
    out.set("created", "1");
    return redirect(`/payment?${out.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo crear el método de pago."
    );
    if (parsed.status === 409) {
      const p = new URLSearchParams(url.search);
      p.set("conflict", "create");
      if (parsed.code) p.set("code", String(parsed.code));
      p.set("message", parsed.message);
      p.set("name", name);
      return redirect(`/payment?${p.toString()}`);
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
