import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { deactivateTransaction } from "~/feature/transaction/transactionApi.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";
import { runWithRequest } from "~/lib/http/requestContext.server";

/**
 * Transaction action (create/update/delete) using PRG:
 * - On success: redirect to /transaction?{created|updated|deleted}=1 (flash handled in loader)
 * - On client validation errors: return 422 with JSON (shown via useActionData/fetcher.data)
 * - On server errors: return 5xx with JSON
 */

export async function deleteSaleAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    // 2) DELETE branch: id comes from the row's fetcher.Form (body), not the URL

    const idParam = formData.get("id");
    // Required + string check (rejects null/File/"")
    const idReqError = validateRequiredId(idParam, "Transacciï¿½n");
    if (idReqError) {
      return jsonResponse(422, idReqError);
    }
    // Numeric (positive integer) check
    const idNum = Number(idParam);
    const idNumError = validateNumberId(idNum, "Transacciï¿½n");
    if (idNumError) {
      return jsonResponse(422, idNumError);
    }

    try {
      await deactivateTransaction(idNum);

      // Success â†’ PRG + flash in loader
      return redirect("/transaction?deleted=1");
    } catch (error) {
      // Server error â†’ return 5xx JSON for inline display
      const parsed = parseAppError(
        error,
        "(Error) No se pudo eliminar la transacciï¿½n seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  });
}
