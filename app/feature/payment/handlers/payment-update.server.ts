import { redirect } from "react-router-dom";
import { updatePayment } from "~/feature/payment/payment-api.server";
import type { UpdatePaymentPayload } from "~/feature/payment/payment";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handlePaymentUpdate({ url, formData }: Ctx) {
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
  const idAccErr = validateRequiredId(String(idAccount), "Cuenta");
  if (idAccErr)
    return jsonResponse(422, {
      error: idAccErr.error,
      source: idAccErr.source,
    });

  const idParam = url.searchParams.get("id");
  const idReqErr = validateRequiredId(idParam, "Método de pago");
  if (idReqErr)
    return jsonResponse(422, {
      error: idReqErr.error,
      source: idReqErr.source,
    });
  const id = Number(idParam);

  const payload: UpdatePaymentPayload = { id, idAccount, name };
  try {
    await updatePayment(payload);
    return redirect("/payment?updated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar el método de pago seleccionado."
    );
    if (parsed.status === 409) {
      setFlash({
        scope: "payment",
        kind: "update-conflict",
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
