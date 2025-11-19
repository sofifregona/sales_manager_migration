import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleProductCreate } from "./handlers/product-create.server";
import { handleProductUpdate } from "./handlers/product-update.server";
import { handleProductDeactivate } from "./handlers/product-deactivate.server";
import { handleProductReactivate } from "./handlers/product-reactivate.server";
import { handleProductIncrement } from "./handlers/product-increment.server";

export async function productAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "reactivate":
        return await handleProductReactivate({ url, formData });
      case "increment":
        return await handleProductIncrement({ url, formData });
      case "deactivate":
        return await handleProductDeactivate({ url, formData });
      case "create":
        return await handleProductCreate({ url, formData });
      case "update":
        return await handleProductUpdate({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}
