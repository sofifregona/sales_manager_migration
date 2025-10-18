import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handlePaymentCreate } from "./handlers/payment-create.server";
import { handlePaymentUpdate } from "./handlers/payment-update.server";
import { handlePaymentDeactivate } from "./handlers/payment-deactivate.server";
import { handlePaymentReactivate } from "./handlers/payment-reactivate.server";
import { handlePaymentReactivateSwap } from "./handlers/payment-reactivate-swap.server";

export async function paymentAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "reactivate":
        return await handlePaymentReactivate({ formData });
      case "reactivate-swap":
        return await handlePaymentReactivateSwap({ formData });
      case "deactivate":
        return await handlePaymentDeactivate({ formData });
      case "create":
        return await handlePaymentCreate({ formData });
      case "update":
        return await handlePaymentUpdate({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}
