import { redirect } from "react-router-dom";
import { createPayment } from "~/feature/payment/payment-api.server";
import type { CreatePaymentPayload } from "~/feature/payment/payment";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handlePaymentCreate({ formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameErr = validateRequired(nameParam, "string", "Nombre");
  if (nameErr)
    return jsonResponse(422, { error: nameErr.error, source: nameErr.source });
  const name = (nameParam as string).trim();

  const idAccountParam = formData.get("idAccount");
  const idAccountReq = validateRequired(idAccountParam, "string", "Cuenta");
  if (idAccountReq)
    return jsonResponse(422, {
      error: idAccountReq.error,
      source: idAccountReq.source,
    });
  const idAccount = Number((idAccountParam as string).trim());
  const idAccErr = validateRequiredId(String(idAccount), "Cuenta"); // req + num
  if (idAccErr)
    return jsonResponse(422, {
      error: idAccErr.error,
      source: idAccErr.source,
    });

  const payload: CreatePaymentPayload = { name, idAccount };
  try {
    await createPayment(payload);
    return redirect("/payment?created=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo crear el método de pago."
    );
    if (parsed.status === 409) {
      setFlash({
        scope: "payment",
        kind: "create-conflict",
        message: parsed.message,
        name,
      } as any);
      return redirect("/payment");
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
