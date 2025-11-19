import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleEmployeeCreate } from "./handlers/employee-create.server";
import { handleEmployeeUpdate } from "./handlers/employee-update.server";
import { handleEmployeeDeactivate } from "./handlers/employee-deactivate.server";
import { handleEmployeeReactivate } from "./handlers/employee-reactivate.server";

export async function employeeAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleEmployeeDeactivate({ url, formData });
      case "reactivate":
        return await handleEmployeeReactivate({ url, formData });
      case "create":
        return await handleEmployeeCreate({ url, formData });
      case "update":
        return await handleEmployeeUpdate({ url, formData });
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada.",
          source: "client",
        });
    }
  });
}
