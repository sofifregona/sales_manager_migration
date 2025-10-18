import { redirect } from "react-router-dom";
import { reactivatePaymentSwap } from "~/feature/payment/payment-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handlePaymentReactivateSwap({ formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(
    currentIdParam,
    "Método de pago actual"
  );
  if (currentIdReqError)
    return jsonResponse(422, {
      error: currentIdReqError.error,
      source: currentIdReqError.source,
    });
  const currentId = Number(currentIdParam);

  const inactiveIdReqError = validateRequiredId(
    inactiveIdParam,
    "Método de pago inactivo"
  );
  if (inactiveIdReqError)
    return jsonResponse(422, {
      error: inactiveIdReqError.error,
      source: inactiveIdReqError.source,
    });
  const inactiveId = Number(inactiveIdParam);

  try {
    await reactivatePaymentSwap(inactiveId, currentId);
    return redirect("/payment?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar el método de pago intercambiando los estados."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
