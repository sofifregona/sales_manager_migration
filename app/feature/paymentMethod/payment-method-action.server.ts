import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handlePaymentMethodCreate } from "./handlers/payment-method-create.server";
import { handlePaymentMethodUpdate } from "./handlers/payment-method-update.server";
import { handlePaymentMethodDeactivate } from "./handlers/payment-method-deactivate.server";
import { handlePaymentMethodReactivate } from "./handlers/payment-method-reactivate.server";
import { handlePaymentMethodReactivateSwap } from "./handlers/payment-method-reactivate-swap.server";

export async function paymentMethodAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "reactivate":
        return await handlePaymentMethodReactivate({ url, formData });
      case "reactivate-swap":
        return await handlePaymentMethodReactivateSwap({ url, formData });
      case "deactivate":
        return await handlePaymentMethodDeactivate({ url, formData });
      case "create":
        return await handlePaymentMethodCreate({ url, formData });
      case "update":
        return await handlePaymentMethodUpdate({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}
