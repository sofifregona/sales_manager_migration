import { redirect, type ActionFunctionArgs } from "react-router-dom";
import {
  createBartable,
  updateBartable,
  deactivateBartable,
} from "~/api/bartable";
import type {
  CreateBartableFormData,
  UpdateBartableFormData,
} from "~/types/bartable";
import { jsonResponse } from "~/utils/helpers/jsonResponse";
import { parseAppError } from "~/utils/helpers/parseAppError";
import {
  validateNumberID,
  validatePositiveInteger,
  validateRequiredAndType,
  validateRequiredID,
} from "~/utils/validations/validationHelpers";

/**
 * Bartable action (create/update/delete) using PRG:
 * - On success: redirect to /bartable?{created|updated|deleted}=1 (flash handled in loader)
 * - On client validation errors: return 422 with JSON (shown via useActionData/fetcher.data)
 * - On server errors: return 5xx with JSON
 */

export async function bartableAction({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const intent = formData.get("_action");

  const intentError = validateRequiredAndType(intent, "string", "Acción");
  if (intentError) {
    return jsonResponse(422, {
      error: intentError.error,
      source: intentError.source,
    });
  }

  // Only allow explicit intents; treat anything else as a bad request
  if (!["create", "update", "delete"].includes(intent!.toString())) {
    return jsonResponse(400, {
      error: "(Error) Acción no soportada.",
      source: "client",
    });
  }

  // 2) DELETE branch: id comes from the row's fetcher.Form (body), not the URL
  if (intent === "delete") {
    const idParam = formData.get("id");
    // Required + string check (rejects null/File/"")
    const idReqError = validateRequiredID(idParam, "Cuenta");
    if (idReqError) {
      return jsonResponse(422, {
        error: idReqError.error,
        source: idReqError.source,
      });
    }
    // Numeric (positive integer) check
    const idNum = Number(idParam);
    const idNumError = validateNumberID(idNum, "Cuenta");
    if (idNumError) {
      return jsonResponse(422, {
        error: idNumError.error,
        source: idNumError.source,
      });
    }

    try {
      await deactivateBartable(idNum);

      // Success → PRG + flash in loader
      return redirect("/bartable?deleted=1");
    } catch (error) {
      // Server error → return 5xx JSON for inline display
      const parsed = parseAppError(
        error,
        "(Error) No se pudo eliminar la mesa seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  }

  // 3) Shared form field for create/update (top form)
  const numParam = formData.get("number");
  // Required numParam: must be non-empty string
  const numParamError = validateRequiredAndType(numParam, "string", "Número");
  if (numParamError) {
    return jsonResponse(422, {
      error: numParamError.error,
      source: numParamError.source,
    });
  }
  // Numeric (positive integer) check
  const num = Number(numParam);
  const numError = validatePositiveInteger(num, "Número");
  if (numError) {
    return jsonResponse(422, {
      error: numError.error,
      source: numError.source,
    });
  }

  // 4) CREATE branch: there must be NO id in URL (mode = create)
  if (intent === "create") {
    const newData: CreateBartableFormData = {
      number: num,
    };

    try {
      await createBartable(newData);
      // Success → PRG + flash in loader
      return redirect("/bartable?created=1");
    } catch (error) {
      const parsed = parseAppError(error, "(Error) No se pudo crear la mesa.");
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
    const idReqError = validateRequiredID(idParam, "Mesa");
    if (idReqError) {
      return jsonResponse(422, {
        error: idReqError.error,
        source: idReqError.source,
      });
    }
    // Numeric (positive integer) check
    const id = Number(idParam);
    const idNumError = validateNumberID(id, "Mesa");
    if (idNumError) {
      return jsonResponse(422, {
        error: idNumError.error,
        source: idNumError.source,
      });
    }

    const updatedData: UpdateBartableFormData = {
      id,
      number: num,
    };

    try {
      await updateBartable(updatedData);
      // Success → PRG + flash in loader (also clears ?id)
      return redirect("/bartable?updated=1");
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo modificar la mesa seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  }
}
