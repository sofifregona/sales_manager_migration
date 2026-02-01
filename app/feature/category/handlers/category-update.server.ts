import { redirect } from "react-router-dom";
import { updateCategory } from "~/feature/category/category-api.server";
import type { UpdateCategoryPayload } from "~/feature/category/category";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";
import { makeConflictCookie } from "~/services/conflictCookie";

type Ctx = { url: URL; formData: FormData };

export async function handleCategoryUpdate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);
  const name = (nameParam as string).trim();

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Categoría");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const updatedData: UpdateCategoryPayload = { id, name };
  try {
    await updateCategory(updatedData);

    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("updated", "1");
    return redirect(`/settings/category?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar la categoría seleccionada."
    );

    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "CATEGORY_EXISTS_INACTIVE") {
        const anyParsed: any = parsed as any;
        const p = new URLSearchParams(url.search);

        if (parsed.code) p.set("code", String(parsed.code));
        p.set("conflict", "update");

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
      }
      return jsonResponse(409, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
