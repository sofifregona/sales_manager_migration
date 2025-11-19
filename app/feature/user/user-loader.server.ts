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
    const flash: Flash = {} as Flash;

    const includeInactive = url.searchParams.get("includeInactive") === "1";

    let users: UserDTO[] | null = null;
    try {
      users = await getAllUsers(includeInactive);
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

    const idParam = url.searchParams.get("id");
    let editingUser: UserDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Usuario");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { users, editingUser, flash };
      }

      const id = parseInt(idParam as string, 10);
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
