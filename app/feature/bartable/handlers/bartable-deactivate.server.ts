import { redirect } from "react-router-dom";
import { deactivateBartable } from "~/feature/bartable/bartable-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBartableDeactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Mesa");
  if (idReqError) return jsonResponse(422, idReqError);
  const idNum = Number(idParam);

  try {
    await deactivateBartable(idNum);
    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("deactivated", "1");
    return redirect(`/bartable?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar la mesa seleccionada."
    );
    if (parsed.status === 409 && (parsed as any).code === "BARTABLE_IN_USE") {
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
