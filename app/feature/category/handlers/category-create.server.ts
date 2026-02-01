import { redirect } from "react-router-dom";
import { createCategory } from "~/feature/category/category-api.server";
import type { CreateCategoryPayload } from "~/feature/category/category";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequired } from "~/utils/validation/validationHelpers";
import { makeConflictCookie } from "~/services/conflictCookie";

type Ctx = { url: URL; formData: FormData };

export async function handleCategoryCreate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);
  const name = (nameParam as string).trim();

  const newData: CreateCategoryPayload = { name };
  try {
    await createCategory(newData);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("created", "1");
    return redirect(`/settings/category?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo crear la categoría."
    );
    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "CATEGORY_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "create");

        const existingId = anyParsed?.details?.existingId as number | undefined;
        if (existingId != null) p.set("elementId", String(existingId));

        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          makeConflictCookie({ scope: "category", name })
        );
        return redirect(`/settings/category?${p.toString()}` as any, {
          headers,
        } as any);
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
