import { redirect } from "react-router-dom";
import { updateBrand } from "~/feature/brand/brand-api.server";
import type { UpdateBrandPayload } from "~/feature/brand/brand";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBrandUpdate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, {
      error: nameParamError.error,
      source: nameParamError.source,
    });
  const name = (nameParam as string).trim();

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Marca");
  if (idReqError)
    return jsonResponse(422, {
      error: idReqError.error,
      source: idReqError.source,
    });
  const id = Number(idParam);

  const updatedData: UpdateBrandPayload = { id, name };
  try {
    await updateBrand(updatedData);
    setFlash({ scope: "brand", kind: "updated-success" });
    return redirect("/brand?updated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar la marca seleccionada."
    );
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "brand",
        kind: "update-conflict",
        message: parsed.message,
        name,
        elementId:
          anyParsed.code === "BRAND_EXISTS_INACTIVE" && anyParsed.details
            ? anyParsed.details.existingId
            : undefined,
      } as any);
      return redirect("/brand");
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
