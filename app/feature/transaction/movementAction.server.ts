import { redirect, type ActionFunctionArgs } from "react-router-dom";
import {
  createTransaction,
  updateTransaction,
  deactivateTransaction,
} from "./transactionApi.server";
import type {
  CreateMovementPayload,
  UpdateMovementPayload,
} from "./transaction";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validatePositiveNumber,
  validateRequiredAndType,
  validateRequiredId,
  validateType,
} from "~/utils/validation/validationHelpers";
import { runWithRequest } from "~/lib/http/requestContext.server";

/**
 * Transaction action (create/update/delete) using PRG:
 * - On success: redirect to /transaction?{created|updated|deleted}=1 (flash handled in loader)
 * - On client validation errors: return 422 with JSON (shown via useActionData/fetcher.data)
 * - On server errors: return 5xx with JSON
 */

export async function movementAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();

    const origin = formData.get("origin");
    if (origin !== "movement") {
      return jsonResponse(422, {
        error: "(Error) Origen desconocido o incompatible.",
        source: "client",
      });
    }

    const intent = formData.get("_action");

    const intentError = validateRequiredAndType(intent, "string", "Acci�n");
    if (intentError) {
      return jsonResponse(422, {
        error: intentError.error,
        source: intentError.source,
      });
    }

    // Only allow explicit intents; treat anything else as a bad request
    if (!["create", "update", "delete"].includes(intent!.toString())) {
      return jsonResponse(400, {
        error: "(Error) Acci�n no soportada.",
        source: "client",
      });
    }

    // 2) DELETE branch: id comes from the row's fetcher.Form (body), not the URL
    if (intent === "delete") {
      const idParam = formData.get("id");
      // Required + string check (rejects null/File/"")
      const idReqError = validateRequiredId(idParam, "Transacci�n");
      if (idReqError) {
        return jsonResponse(422, {
          error: idReqError.error,
          source: idReqError.source,
        });
      }
      // Numeric (positive integer) check
      const idNum = Number(idParam);
      const idNumError = validateNumberId(idNum, "Transacci�n");
      if (idNumError) {
        return jsonResponse(422, {
          error: idNumError.error,
          source: idNumError.source,
        });
      }

      try {
        await deactivateTransaction(idNum);

        // Success → PRG + flash in loader
        return redirect("/transaction?deleted=1");
      } catch (error) {
        // Server error → return 5xx JSON for inline display
        const parsed = parseAppError(
          error,
          "(Error) No se pudo eliminar la Transacci�n seleccionada."
        );
        return jsonResponse(parsed.status ?? 500, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }

    // 3) Shared form field for create/update (top form)
    const accountParam = formData.get("idAccount");
    // Required name: must be non-empty string
    const accountParamError = validateRequiredAndType(
      accountParam,
      "string",
      "Nombre"
    );
    if (accountParamError) {
      return jsonResponse(422, {
        error: accountParamError.error,
        source: accountParamError.source,
      });
    }
    const accountStr = accountParam!.toString().trim();
    const idAccount = Number(accountStr);
    const idAccountError = validateNumberId(idAccount, "Cuenta");
    if (idAccountError) {
      return jsonResponse(422, {
        error: idAccountError.error,
        source: idAccountError.source,
      });
    }

    const typeParam = formData.get("type");
    const typeParamError = validateRequiredAndType(
      typeParam,
      "string",
      "Tipo de Operaci�n"
    );
    if (typeParamError) {
      return jsonResponse(422, {
        error: typeParamError.error,
        source: typeParamError.source,
      });
    }
    const typeStr = typeParam!.toString().trim();
    if (!["income", "expense"].includes(typeStr)) {
      return jsonResponse(400, {
        error: "(Error) Operaci�n no soportada.",
        source: "client",
      });
    }
    const type = typeStr as "income" | "expense";

    const amountParam = formData.get("amount");
    const amountParamError = validateRequiredAndType(
      amountParam,
      "string",
      "Monto"
    );
    if (amountParamError) {
      return jsonResponse(422, {
        error: amountParamError.error,
        source: amountParamError.source,
      });
    }
    const amountStr = amountParam?.toString().trim();
    const amount = Number(amountStr);
    const amountError = validatePositiveNumber(amount, "Monto");
    if (amountError) {
      return jsonResponse(422, {
        error: amountError.error,
        source: amountError.source,
      });
    }

    let description: string | null = null;
    const descParam = formData.get("description");
    if (descParam) {
      const descParamError = validateType(descParam, "string", "Descripci�n");
      if (descParamError) {
        return jsonResponse(422, {
          error: descParamError.error,
          source: descParamError.source,
        });
      }
      description = descParam.toString().trim();
    }

    if (intent === "create") {
      // 4) CREATE branch: there must be NO id in URL (mode = create)
      const newData: CreateMovementPayload = {
        idAccount,
        type,
        amount,
        origin,
        description,
      };

      try {
        await createTransaction(newData);
        // Success → PRG + flash in loader
        return redirect("/transaction?created=1");
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo crear la Transacci�n."
        );
        return jsonResponse(parsed.status ?? 500, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }

    // 5) UPDATE branch: id comes from the URL query (?id=...), not from the form
    if (intent === "update") {
      const idParam = url.searchParams.get("id");

      // Required + string check for URL param
      const idReqError = validateRequiredId(idParam, "Transacci�n");
      if (idReqError) {
        return jsonResponse(422, {
          error: idReqError.error,
          source: idReqError.source,
        });
      }
      // Numeric (positive integer) check
      const id = Number(idParam);
      const idNumError = validateNumberId(id, "Transacci�n");
      if (idNumError) {
        return jsonResponse(422, {
          error: idNumError.error,
          source: idNumError.source,
        });
      }

      const updatedData: UpdateMovementPayload = {
        id,
        idAccount,
        type,
        amount,
        description,
      };

      try {
        await updateTransaction(updatedData);
        // Success → PRG + flash in loader (also clears ?id)
        return redirect("/transaction?updated=1");
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo modificar la Transacci�n seleccionada."
        );
        return jsonResponse(parsed.status ?? 500, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }
  });
}
