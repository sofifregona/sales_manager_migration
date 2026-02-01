import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleUserCreate } from "./handlers/user-create.server";
import { handleUserUpdate } from "./handlers/user-update.server";
import { handleUserDeactivate } from "./handlers/user-deactivate.server";
import { handleUserReactivate } from "./handlers/user-reactivate.server";
import { handleResetUserPassword } from "./handlers/user-reset-password.server";

export async function userAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acci�n");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "reactivate":
        return await handleUserReactivate({ url, formData });
      case "deactivate":
        return await handleUserDeactivate({ url, formData });
      case "create":
        return await handleUserCreate({ url, formData });
      case "update":
        return await handleUserUpdate({ url, formData });
      case "reset-password":
        return await handleResetUserPassword({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}
