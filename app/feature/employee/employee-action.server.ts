import type { ActionFunctionArgs } from "react-router-dom";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseCRUDIntent } from "~/utils/validation/intents";
import { handleEmployeeCreate } from "./handlers/employee-create.server";
import { handleEmployeeUpdate } from "./handlers/employee-update.server";
import { handleEmployeeDeactivate } from "./handlers/employee-deactivate.server";
import { handleEmployeeReactivate } from "./handlers/employee-reactivate.server";
import { handleEmployeeReactivateSwap } from "./handlers/employee-reactivate-swap.server";

export async function employeeAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const parsed = parseCRUDIntent(formData.get("_action"), "Acción");
    if (!parsed.ok) return parsed.response;

    switch (parsed.intent) {
      case "deactivate":
        return await handleEmployeeDeactivate({ formData });
      case "reactivate":
        return await handleEmployeeReactivate({ formData });
      case "reactivate-swap":
        return await handleEmployeeReactivateSwap({ formData });
      case "create":
        return await handleEmployeeCreate({ formData });
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
