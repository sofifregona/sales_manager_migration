import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleBartableCreate } from "./handlers/bartable-create.server";
import { handleBartableUpdate } from "./handlers/bartable-update.server";
import { handleBartableDeactivate } from "./handlers/bartable-deactivate.server";
import { handleBartableReactivate } from "./handlers/bartable-reactivate.server";
import { handleBartableReactivateSwap } from "./handlers/bartable-reactivate-swap.server";

export async function bartableAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleBartableDeactivate({ formData });
      case "reactivate":
        return await handleBartableReactivate({ formData });
      case "reactivate-swap":
        return await handleBartableReactivateSwap({ formData });
      case "create":
        return await handleBartableCreate({ formData });
      case "update":
        return await handleBartableUpdate({ url, formData });
      default:
        return jsonResponse(400, { error: "(Error) Acción no soportada.", source: "client" });
    }
  });
}

