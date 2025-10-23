﻿import { redirect } from "react-router-dom";
import { createAccount } from "~/feature/account/account-api.server";
import type { CreateAccountPayload } from "~/feature/account/account";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRangeLength,
  validateRequired,
  validateType,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleCreateAccount({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);
  const name = (nameParam as string).replace(/\s+/g, " ").trim();
  const nameLengthError = validateRangeLength(name, 5, 80, "Nombre");
  if (nameLengthError) return nameLengthError;

  let desc: string | null = null;
  const descParam = formData.get("description");
  if (descParam) {
    const descError = validateType(descParam, "string", "Descripcion");
    if (descError) return descError;
    desc = (descParam as string).replace(/\s+/g, " ").trim();
  }

  const newData: CreateAccountPayload = { name, description: desc };

  try {
    await createAccount(newData);

    const out = new URLSearchParams();
    out.set("created", "1");
    if (url.searchParams.get("includeInactive") === "1")
      out.set("includeInactive", "1");
    return redirect(`/account?${out.toString()}`);
  } catch (error) {
    console.log(error);
    const parsed = parseAppError(error, "(Error) No se pudo crear la cuenta.");
    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "ACCOUNT_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "create");
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
