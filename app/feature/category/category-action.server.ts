import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleCategoryCreate } from "./handlers/category-create.server";
import { handleCategoryUpdate } from "./handlers/category-update.server";
import { handleCategoryDeactivate } from "./handlers/category-deactivate.server";
import { handleCategoryReactivate } from "./handlers/category-reactivate.server";

export async function categoryAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "AcciÃ³n");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleCategoryDeactivate({ formData });
      case "reactivate":
        return await handleCategoryReactivate({ formData });
      case "reactivate-swap":\n        return await (await import("./handlers/category-reactivate-swap.server")).handleCategoryReactivateSwap({ formData });\n      case "create":
        return await handleCategoryCreate({ formData });
      case "update":
        return await handleCategoryUpdate({ url, formData });
      default:
        return jsonResponse(400, { error: "(Error) AcciÃ³n no soportada.", source: "client" });
    }
  });
}


