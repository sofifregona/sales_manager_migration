import { redirect } from "react-router-dom";
import { reactivatePaymentMethod } from "~/feature/paymentMethod/payment-method-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handlePaymentMethodReactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Método de pago");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);
  const strategyParam = formData.get("strategy");
  const strategy = strategyParam
    ? (String(strategyParam) as "reactivate-account" | "cancel")
    : undefined;
  try {
    await reactivatePaymentMethod(id, strategy);
    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("reactivated", "1");
    return redirect(`/settings/payment-method?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar el método de pago seleccionado."
    );
    if (parsed.status === 409 && (parsed as any).code === "ACCOUNT_INACTIVE") {
      return jsonResponse(409, {
        error: parsed.message,
        code: (parsed as any).code,
        details: (parsed as any).details,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
