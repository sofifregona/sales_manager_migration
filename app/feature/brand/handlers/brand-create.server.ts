import { redirect } from "react-router-dom";
import { createBrand } from "~/feature/brand/brand-api.server";
import type { CreateBrandPayload } from "~/feature/brand/brand";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { makeConflictCookie } from "~/services/conflictCookie";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRangeLength,
  validateRequired,
  validateRequiredAndType,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleBrandCreate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequiredAndType(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);

  const name = (nameParam as string).replace(/\s+/g, " ").trim();
  const nameLengthError = validateRangeLength(name, 3, 80, "Nombre");
  if (nameLengthError) return nameLengthError;

  const newData: CreateBrandPayload = { name };
  try {
    await createBrand(newData);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("created", "1");
    return redirect(`/settings/brand?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear la marca.");
    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "BRAND_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "create");

        const existingId = anyParsed?.details?.existingId as number | undefined;
        if (existingId != null) p.set("elementId", String(existingId));

        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          makeConflictCookie({ scope: "brand", name })
        );
        return redirect(
          `/settings/brand?${p.toString()}` as any,
          {
            headers,
          } as any
        );
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
