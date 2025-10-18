import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import {
  getAllBartables,
  getBartableById,
} from "~/feature/bartable/bartable-api.server";
import type {
  BartableDTO,
  BartableLoaderData,
} from "~/feature/bartable/bartable";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequiredId,
  validateNumberId,
} from "~/utils/validation/validationHelpers";

export async function bartableLoader({
  request,
}: LoaderFunctionArgs): Promise<BartableLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {} as Flash;

    const includeInactive = url.searchParams.get("includeInactive") === "1";
    const rawField = url.searchParams.get("sortField");
    if (rawField && !["number", "active"].includes(rawField)) {
      parseAppError(
        (flash.error = "(Error) Campo de ordenación inválido."),
        (flash.source = "client")
      );
    }
    const sortField = (rawField as "number" | "active") ?? "number";
    const rawDirection = url.searchParams.get("sortDirection");
    if (rawDirection && !["ASC", "DESC"].includes(rawDirection.toUpperCase())) {
      parseAppError(
        (flash.error = "(Error) Dirección de ordenación inválida."),
        (flash.source = "client")
      );
    }
    const sortDirection = (rawDirection as "ASC" | "DESC") ?? "ASC";

    let bartables: BartableDTO[] | null = null;
    try {
      bartables = await getAllBartables(includeInactive, {
        sortField,
        sortDirection,
      });
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de mesas."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    const idParam = url.searchParams.get("id");
    let editingBartable: BartableDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Mesa");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { bartables, editingBartable, flash };
      }

      const id = parseInt(idParam as string, 10);
      const idError = validateNumberId(id, "Mesa");
      if (idError) {
        flash.error = idError.error;
        flash.source = idError.source;
        return { bartables, editingBartable, flash };
      }

      try {
        editingBartable = await getBartableById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar la mesa seleccionada."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingBartable = null;
      }
    }
    return { bartables, editingBartable, flash };
  });
}
