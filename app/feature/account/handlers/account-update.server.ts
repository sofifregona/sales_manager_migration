import { redirect } from "react-router-dom";
import { updateAccount } from "~/feature/account/account-api.server";
import type { UpdateAccountPayload } from "~/feature/account/account";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequiredId,
  validateNumberId,
  validateRequired,
  validateType,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleUpdateAccount({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, {
      error: nameParamError.error,
      source: nameParamError.source,
    });
  const name = (nameParam as string).trim();

  let desc: string | null = null;
  const descParam = formData.get("description");
  if (descParam) {
    const descError = validateType(descParam, "string", "Descripcion");
    if (descError)
      return jsonResponse(422, {
        error: descError.error,
        source: descError.source,
      });
    desc = (descParam as string).trim();
  }

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Cuenta");
  if (idReqError)
    return jsonResponse(422, {
      error: idReqError.error,
      source: idReqError.source,
    });
  const id = Number(idParam);

  const updatedData: UpdateAccountPayload = { id, name, description: desc };

  try {
    await updateAccount(updatedData);
    setFlash({ scope: "account", kind: "updated-success" });
    return redirect("/account?updated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar la cuenta seleccionada."
    );
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "account",
        kind: "update-conflict",
        message: parsed.message,
        name,
        description: desc ?? null,
        elementId:
          anyParsed.code === "ACCOUNT_EXISTS_INACTIVE" && anyParsed.details
            ? anyParsed.details.existingId
            : undefined,
      });
      return redirect("/account");
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
