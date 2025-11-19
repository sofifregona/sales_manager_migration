import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleProviderCreate } from "./handlers/provider-create.server";
import { handleProviderUpdate } from "./handlers/provider-update.server";
import { handleProviderDeactivate } from "./handlers/provider-deactivate.server";
import { handleProviderReactivate } from "./handlers/provider-reactivate.server";

export async function providerAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleProviderDeactivate({ url, formData });
      case "reactivate":
        return await handleProviderReactivate({ url, formData });
      case "create":
        return await handleProviderCreate({ url, formData });
      case "update":
        return await handleProviderUpdate({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}

