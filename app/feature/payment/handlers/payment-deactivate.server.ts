import { redirect } from "react-router-dom";
import { deactivatePayment } from "~/feature/payment/payment-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handlePaymentDeactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Método de pago");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  try {
    await deactivatePayment(id);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("deactivated", "1");
    return redirect(`/payment?${p.toString()}`);
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
