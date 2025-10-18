import { redirect } from "react-router-dom";
import { deactivatePayment } from "~/feature/payment/payment-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handlePaymentDeactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Método de pago");
  if (idReqError)
    return jsonResponse(422, {
      error: idReqError.error,
      source: idReqError.source,
    });
  const id = Number(idParam);
  try {
    await deactivatePayment(id);
    return redirect("/payment?deleted=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar el método de pago seleccionado."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
