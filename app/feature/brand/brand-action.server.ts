import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleBrandCreate } from "./handlers/brand-create.server";
import { handleBrandUpdate } from "./handlers/brand-update.server";
import { handleBrandDeactivate } from "./handlers/brand-deactivate.server";
import { handleBrandReactivate } from "./handlers/brand-reactivate.server";
import { handleBrandReactivateSwap } from "./handlers/brand-reactivate-swap.server";

export async function brandAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleBrandDeactivate({ formData });
      case "reactivate":
        return await handleBrandReactivate({ formData });
      case "reactivate-swap":
        return await handleBrandReactivateSwap({ formData });
      case "create":
        return await handleBrandCreate({ formData });
      case "update":
        return await handleBrandUpdate({ url, formData });
      default:
        return jsonResponse(400, { error: "(Error) Acción no soportada.", source: "client" });
    }
  });
}

