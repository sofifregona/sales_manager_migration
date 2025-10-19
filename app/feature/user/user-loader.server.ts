import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { getAllUsers, getUserById } from "./user-api.server";
// Types
import type { UserDTO, UserLoaderData } from "./user";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
// Helpers
import {
  validateRequiredId,
  validateNumberId,
} from "~/utils/validation/validationHelpers";

export async function userLoader({
  request,
}: LoaderFunctionArgs): Promise<UserLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const created = url.searchParams.get("created") === "1";
    const updated = url.searchParams.get("updated") === "1";
    const deleted = url.searchParams.get("deleted") === "1";

    let users: UserDTO[] | null = null;
    try {
      users = await getAllUsers();
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de usuarios."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    let editingUser: UserDTO | null = null;
    const flash: Flash = { created, updated, deleted };

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Usuario");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { users, editingUser, flash };
      }

      const id = parseInt(idParam as string, 10);
      const idError = validateNumberId(id, "Usuario");
      if (idError) {
        flash.error = idError.error;
        flash.source = idError.source;
        return { users, editingUser, flash };
      }

      try {
        editingUser = await getUserById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar el usuario seleccionado."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingUser = null;
      }
    }
    return { users, editingUser, flash };
  });
}
