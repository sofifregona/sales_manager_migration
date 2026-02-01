import { redirect } from "react-router-dom";
import { reactivateBrand } from "~/feature/brand/brand-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBrandReactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Marca");
  if (idReqError) return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  try {
    await reactivateBrand(idNum);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("reactivated", "1");
    return redirect(`/settings/brand?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la marca seleccionada."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
