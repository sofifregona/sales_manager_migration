import { redirect } from "react-router-dom";
import { updateCategory } from "~/feature/category/category-api.server";
import type { UpdateCategoryPayload } from "~/feature/category/category";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleCategoryUpdate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, {
      error: nameParamError.error,
      source: nameParamError.source,
    });
  const name = (nameParam as string).trim();

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Categoría");
  if (idReqError)
    return jsonResponse(422, {
      error: idReqError.error,
      source: idReqError.source,
    });
  const id = Number(idParam);

  const updatedData: UpdateCategoryPayload = { id, name };
  try {
    await updateCategory(updatedData);
    return redirect("/category?updated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar la categoría seleccionada."
    );
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "category",
        kind: "update-conflict",
        message: parsed.message,
        name,
        categoryId:
          anyParsed.code === "CATEGORY_EXISTS_INACTIVE" && anyParsed.details
            ? anyParsed.details.existingId
            : undefined,
      } as any);
      return redirect("/category");
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
