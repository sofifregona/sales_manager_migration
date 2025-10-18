import { redirect, type ActionFunctionArgs } from "react-router-dom";
import {
  createUser,
  updateUser,
  deactivateUser,
} from "~/feature/user/userApi.server";
import type { CreateUserPayload, UpdateUserPayload } from "~/feature/user/user";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredAndType,
  validateRequiredId,
  validateType,
} from "~/utils/validation/validationHelpers";

/**
 * User action (create/update/delete) using PRG:
 * - On success: redirect to /user?{created|updated|deleted}=1 (flash handled in loader)
 * - On client validation errors: return 422 with JSON (shown via useActionData/fetcher.data)
 * - On server errors: return 5xx with JSON
 */

export async function userAction({ request }: ActionFunctionArgs) {
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
    const idReqError = validateRequiredId(idParam, "Cuenta");
    if (idReqError) {
      return jsonResponse(422, {
        error: idReqError.error,
        source: idReqError.source,
      });
    }
    // Numeric (positive integer) check
    const idNum = Number(idParam);
    const idNumError = validateNumberId(idNum, "Cuenta");
    if (idNumError) {
      return jsonResponse(422, {
        error: idNumError.error,
        source: idNumError.source,
      });
    }

    try {
      await deactivateUser(idNum);

      // Success â†’ PRG + flash in loader
      return redirect("/user?deleted=1");
    } catch (error) {
      // Server error â†’ return 5xx JSON for inline display
      const parsed = parseAppError(
        error,
        "(Error) No se pudo eliminar la cuenta seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  }

  // 3) Shared form fields for create/update (top form)
  const nameParam = formData.get("name");
  // Required name: must be non-empty string
  const nameParamError = validateRequiredAndType(nameParam, "string", "Nombre");
  if (nameParamError) {
    return jsonResponse(422, {
      error: nameParamError.error,
      source: nameParamError.source,
    });
  }
  const name = nameParam!.toString().trim();

  // Optional description: allow empty â†’ normalize to null
  let desc: string | null = null;
  const descParam = formData.get("description");
  if (descParam) {
    // Type guard (must be string if present)
    const descError = validateType(descParam, "string", "Descripción");
    if (descError) {
      return jsonResponse(422, {
        error: descError.error,
        source: descError.source,
      });
    }
    desc = descParam.toString().trim();
  }

  // 4) CREATE branch: there must be NO id in URL (mode = create)
  if (intent === "create") {
    const newData: CreateUserPayload = {
      name,
      description: desc,
    };

    try {
      await createUser(newData);
      // Success â†’ PRG + flash in loader
      return redirect("/user?created=1");
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo crear la cuenta."
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
    const idReqError = validateRequiredId(idParam, "Cuenta");
    if (idReqError) {
      return jsonResponse(422, {
        error: idReqError.error,
        source: idReqError.source,
      });
    }
    // Numeric (positive integer) check
    const id = Number(idParam);
    const idNumError = validateNumberId(id, "Cuenta");
    if (idNumError) {
      return jsonResponse(422, {
        error: idNumError.error,
        source: idNumError.source,
      });
    }

    const updatedData: UpdateUserPayload = {
      id,
      name,
      description: desc,
    };

    try {
      await updateUser(updatedData);
      // Success â†’ PRG + flash in loader (also clears ?id)
      return redirect("/user?updated=1");
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo modificar la cuenta seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  }
}
