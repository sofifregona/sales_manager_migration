import { redirect } from "react-router-dom";
import { reactivatePaymentSwap } from "~/feature/payment/payment-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handlePaymentReactivateSwap({ url, formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(
    currentIdParam,
    "Método de pago actual"
  );
  if (currentIdReqError)
    return jsonResponse(422, currentIdReqError);
  const currentId = Number(currentIdParam);

  const inactiveIdReqError = validateRequiredId(
    inactiveIdParam,
    "Método de pago inactivo"
  );
  if (inactiveIdReqError)
    return jsonResponse(422, inactiveIdReqError);
  const inactiveId = Number(inactiveIdParam);

  const strategyParam = formData.get("strategy");
  const strategy = strategyParam ? (String(strategyParam) as "reactivate-account" | "cancel") : undefined;
  try {
    await reactivatePaymentSwap(inactiveId, currentId, strategy);
    const out = new URLSearchParams();
    if (url.searchParams.get("includeInactive") === "1")
      out.set("includeInactive", "1");
    out.set("reactivated", "1");
    return redirect(`/payment?${out.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar el método de pago intercambiando los estados."
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
