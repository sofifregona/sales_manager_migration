import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createBrand, updateBrand, deactivateBrand } from "~/api/brand";
import type { CreateBrandFormData, UpdateBrandFormData } from "~/types/brand";
import { jsonResponse } from "~/utils/helpers/jsonResponse";
import { parseAppError } from "~/utils/helpers/parseAppError";
import {
  validateNumberID,
  validateRequiredAndType,
  validateRequiredID,
} from "~/utils/validations/validationHelpers";

/**
 * Brand action (create/update/delete) using PRG:
 * - On success: redirect to /brand?{created|updated|deleted}=1 (flash handled in loader)
 * - On client validation errors: return 422 with JSON (shown via useActionData/fetcher.data)
 * - On server errors: return 5xx with JSON
 */

export async function brandAction({ request }: ActionFunctionArgs) {
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
    const idReqError = validateRequiredID(idParam, "Marca");
    if (idReqError) {
      return jsonResponse(422, {
        error: idReqError.error,
        source: idReqError.source,
      });
    }
    // Numeric (positive integer) check
    const idNum = Number(idParam);
    const idNumError = validateNumberID(idNum, "Marca");
    if (idNumError) {
      return jsonResponse(422, {
        error: idNumError.error,
        source: idNumError.source,
      });
    }

    try {
      await deactivateBrand(idNum);

      // Success → PRG + flash in loader
      return redirect("/brand?deleted=1");
    } catch (error) {
      // Server error → return 5xx JSON for inline display
      const parsed = parseAppError(
        error,
        "(Error) No se pudo eliminar la marca seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  }

  // 3) Shared form field for create/update (top form)
  const name = formData.get("name");
  // Required name: must be non-empty string
  const nameError = validateRequiredAndType(name, "string", "Nombre");
  if (nameError) {
    return jsonResponse(422, {
      error: nameError.error,
      source: nameError.source,
    });
  }

  // 4) CREATE branch: there must be NO id in URL (mode = create)
  if (intent === "create") {
    const newData: CreateBrandFormData = {
      name: (name as string).trim(),
    };

    try {
      await createBrand(newData);
      // Success → PRG + flash in loader
      return redirect("/brand?created=1");
    } catch (error) {
      const parsed = parseAppError(error, "(Error) No se pudo crear la marca.");
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
    const idReqError = validateRequiredID(idParam, "Marca");
    if (idReqError) {
      return jsonResponse(422, {
        error: idReqError.error,
        source: idReqError.source,
      });
    }
    // Numeric (positive integer) check
    const id = Number(idParam);
    const idNumError = validateNumberID(id, "Marca");
    if (idNumError) {
      return jsonResponse(422, {
        error: idNumError.error,
        source: idNumError.source,
      });
    }

    const updatedData: UpdateBrandFormData = {
      id,
      name: (name as string).trim(),
    };

    try {
      await updateBrand(updatedData);
      // Success → PRG + flash in loader (also clears ?id)
      return redirect("/brand?updated=1");
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo modificar la marca seleccionada."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  }
}
