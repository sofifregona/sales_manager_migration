import { redirect } from "react-router-dom";
import { reactivatePayment } from "~/feature/payment/payment-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handlePaymentReactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Método de pago");
  if (idReqError)
    return jsonResponse(422, idReqError);
  const id = Number(idParam);
  try {
    await reactivatePayment(id);
    return redirect("/payment?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar el método de pago seleccionado."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
