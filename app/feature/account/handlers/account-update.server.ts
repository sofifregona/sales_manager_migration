import { redirect } from "react-router-dom";
import { updateAccount } from "~/feature/account/account-api.server";
import type { UpdateAccountPayload } from "~/feature/account/account";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequiredId,
  validateNumberId,
  validateRequired,
  validateType,
  validateRangeLength,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleUpdateAccount({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);
  const name = (nameParam as string).replace(/\s+/g, " ").trim();
  const nameLengthError = validateRangeLength(name, 5, 80, "Nombre");
  if (nameLengthError) return jsonResponse(422, nameLengthError);

  let desc: string | null = null;
  const descParam = formData.get("description");
  if (descParam) {
    const descError = validateType(descParam, "string", "Descripcion");
    if (descError) return jsonResponse(422, descError);
    desc = (descParam as string).replace(/\s+/g, " ").trim();
  }

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Cuenta");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const updatedData: UpdateAccountPayload = { id, name, description: desc };

  try {
    await updateAccount(updatedData);

    const out = new URLSearchParams();
    out.set("updated", "1");

    if (url.searchParams.get("includeInactive") === "1")
      out.set("includeInactive", "1");

    return redirect(`/account?${out.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar la cuenta seleccionada."
    );

    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "ACCOUNT_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "update");
        p.set("message", parsed.message);
        p.set("name", name);
        if (desc != null) p.set("description", desc);

        const existingId = anyParsed?.details?.existingId as number | undefined;

        if (existingId != null) p.set("elementId", String(existingId));
        return redirect(`/account?${p.toString()}`);
      } else {
        return jsonResponse(409, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
