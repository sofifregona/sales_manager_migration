import { redirect } from "react-router-dom";
import { createAccount } from "~/feature/account/account-api.server";
import type { CreateAccountPayload } from "~/feature/account/account";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRangeLength,
  validateRequired,
  validateType,
} from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleCreateAccount({ formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, nameParamError);
  const name = (nameParam as string).replace(/\s+/g, " ").trim();
  const nameLengthError = validateRangeLength(name, 8, 80, "Nombre");
  if (nameLengthError)
    return jsonResponse(422, nameLengthError);

  let desc: string | null = null;
  const descParam = formData.get("description");
  if (descParam) {
    const descError = validateType(descParam, "string", "Descripcion");
    if (descError)
      return jsonResponse(422, descError);
    desc = (descParam as string).replace(/\s+/g, " ").trim();
  }

  const newData: CreateAccountPayload = { name, description: desc };

  try {
    await createAccount(newData);
    setFlash({ scope: "account", kind: "created-success" });
    return redirect("/account?created=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear la cuenta.");
    if (parsed.status === 409) {
      const anyParsed: any = parsed as any;
      setFlash({
        scope: "account",
        kind: "create-conflict",
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
