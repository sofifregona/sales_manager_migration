import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleCategoryCreate } from "./handlers/category-create.server";
import { handleCategoryUpdate } from "./handlers/category-update.server";
import { handleCategoryDeactivate } from "./handlers/category-deactivate.server";
import { handleCategoryReactivate } from "./handlers/category-reactivate.server";
import { handleCategoryReactivateSwap } from "./handlers/category-reactivate-swap.server";

export async function categoryAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleCategoryDeactivate({ url, formData });
      case "reactivate":
        return await handleCategoryReactivate({ url, formData });
      case "reactivate-swap":
        return await handleCategoryReactivateSwap({ url, formData });
      case "create":
        return await handleCategoryCreate({ url, formData });
      case "update":
        return await handleCategoryUpdate({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}

