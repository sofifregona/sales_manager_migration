import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { deleteSale } from "~/feature/sale/sale-api.server";

export async function deleteSaleAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const formData = await request.formData();

    const idParam = formData.get("id");
    const idReqError = validateRequiredId(idParam, "Venta");
    if (idReqError) {
      return jsonResponse(422, idReqError);
    }
    const idNum = Number(idParam);
    const idNumError = validateNumberId(idNum, "Venta");
    if (idNumError) {
      return jsonResponse(422, idNumError);
    }

    const sourceParam = formData.get("source");
    const source = typeof sourceParam === "string" ? sourceParam : undefined;

    try {
      await deleteSale(idNum);
      if (source === "open") {
        // Delete triggered from the open sale screen → go back to Order panel
        return redirect("/sale/order");
      }
      // From listing screen → do not redirect (allow UI to update inline)
      return jsonResponse(200, { ok: true });
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo eliminar la venta seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  });
}

