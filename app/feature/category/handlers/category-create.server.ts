import { redirect } from "react-router-dom";
import { createCategory } from "~/feature/category/category-api.server";
import type { CreateCategoryPayload } from "~/feature/category/category";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequired } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleCategoryCreate({ formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, nameParamError);
  const name = (nameParam as string).trim();

  const newData: CreateCategoryPayload = { name };
  try {
    await createCategory(newData);
    return redirect("/category?created=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo crear la categorÃ­a."
    );
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "category",
        kind: "create-conflict",
        message: parsed.message,
        name,
        categoryId:
          anyParsed.code === "CATEGORY_EXISTS_INACTIVE" && anyParsed.details
            ? anyParsed.details.existingId
            : undefined,
      } as any);
      return redirect("/category");
    }
    if (
      (parsed as any).status === 409 &&
      (parsed as any).code === "CATEGORY_IN_USE"
    ) {
      return jsonResponse(409, {
        error: parsed.message,
        code: (parsed as any).code,
        details: (parsed as any).details,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
