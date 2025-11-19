import { redirect } from "react-router-dom";
import { jsonResponse } from "~/lib/http/jsonResponse";
// import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateFilteredId,
  validateIsPositive,
  validateNoEmptyList,
  validateNumberId,
  validatePositiveInteger,
  validateRangeLength,
  validateRequired,
  validateRequiredId,
  validateType,
} from "~/utils/validation/validationHelpers";
import type { IncrementPricePayload } from "../product";
import { incrementProduct } from "../product-api.server";

type Ctx = { url: URL; formData: FormData };

export async function handleProductIncrement({ url, formData }: Ctx) {
  const idsParams = formData.getAll("ids");
  const list: number[] = [];

  for (const idParam of idsParams) {
    const idReqError = validateRequiredId(idParam, "Producto");
    if (idReqError) {
      return jsonResponse(422, idReqError);
    }
    // Numeric (positive integer) check
    const idNum = Number(idParam);
    const idNumError = validateNumberId(idNum, "Producto");
    if (idNumError) {
      return jsonResponse(422, idNumError);
    }
    list.push(idNum);
  }

  const ids = [...new Set(list)];
  const emptyListError = validateNoEmptyList(ids, "Productos");
  if (emptyListError) {
    return jsonResponse(422, emptyListError);
  }

  // Validations for price (input)
  const percentStr = formData.get("percent");
  const percentStrError = validateRequired(percentStr, "string", "Porcentaje");
  if (percentStrError) {
    return jsonResponse(422, percentStrError);
  }
  // Validations for price (parsed)
  const percent = Number(percentStr);
  const percentError = validatePositiveInteger(percent, "Porcentaje");
  if (percentError) {
    return jsonResponse(422, percentError);
  }

  const data: IncrementPricePayload = {
    ids,
    percent,
  };

  try {
    await incrementProduct(data);

    const p = new URLSearchParams(url.search);
    // Limpiar claves efímeras de conflicto/edición y selección
    ["id", "ids", "conflict", "code", "elementId", "message"].forEach((k) => p.delete(k));
    p.set("incremented", "1");
    return redirect(`/product?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudieron actualizar los precios."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
