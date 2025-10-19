import { redirect } from "react-router-dom";
import { createBrand } from "~/feature/brand/brand-api.server";
import type { CreateBrandPayload } from "~/feature/brand/brand";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequired } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleBrandCreate({ formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, nameParamError);
  const name = (nameParam as string).trim();

  const newData: CreateBrandPayload = { name };
  try {
    await createBrand(newData);
    setFlash({ scope: "brand", kind: "created-success" });
    return redirect("/brand?created=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear la marca.");
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "brand",
        kind: "create-conflict",
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
