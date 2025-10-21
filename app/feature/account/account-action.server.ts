import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleCreateAccount } from "./handlers/account-create.server";
import { handleUpdateAccount } from "./handlers/account-update.server";
import { handleDeactivateAccount } from "./handlers/account-deactivate.server";
import { handleReactivateAccount } from "./handlers/account-reactivate.server";
import { handleReactivateSwapAccount } from "./handlers/account-reactivate-swap.server";

export async function accountAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleDeactivateAccount({ url, formData });
      case "reactivate":
        return await handleReactivateAccount({ url, formData });
      case "reactivate-swap":
        return await handleReactivateSwapAccount({ url, formData });
      case "create":
        return await handleCreateAccount({ url, formData });
      case "update":
        return await handleUpdateAccount({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}
