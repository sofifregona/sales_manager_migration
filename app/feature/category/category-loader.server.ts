import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { getAllCategories, getCategoryById } from "./category-api.server";
import type { CategoryDTO, CategoryLoaderData } from "./category";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";
// Sorting local en la tabla; el loader solo maneja includeInactive

export async function categoryLoader({
  request,
}: LoaderFunctionArgs): Promise<CategoryLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {} as Flash;

    const includeInactive = url.searchParams.get("includeInactive") === "1";
    let categories: CategoryDTO[] | null = null;
    try {
      categories = await getAllCategories(includeInactive);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de categorías."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    const idParam = url.searchParams.get("id");
    let editingCategory: CategoryDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Categoría");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { categories, editingCategory, flash };
      }

      const id = parseInt(idParam as string, 10);
      try {
        editingCategory = await getCategoryById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar la categoría seleccionada."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingCategory = null;
      }
    }
    return { categories, editingCategory, flash };
  });
}

