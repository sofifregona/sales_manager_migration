import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import {
  getAllAccounts,
  getAccountById,
} from "~/feature/account/account-api.server";
// Types
import type { AccountDTO, AccountLoaderData } from "~/feature/account/account";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
// Helpers
import {
  validateRequiredId,
  validateNumberId,
} from "~/utils/validation/validationHelpers";

export async function accountLoader({
  request,
}: LoaderFunctionArgs): Promise<AccountLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {} as Flash;

    const includeInactive = url.searchParams.get("includeInactive") === "1";
    const rawField = url.searchParams.get("sortField");
    if (rawField && !["name", "active"].includes(rawField)) {
      parseAppError(
        (flash.error = "(Error) Campo de ordenación inválido."),
        (flash.source = "client")
      );
    }
    const sortField = (rawField as "name" | "active") ?? "name";
    const rawDirection = url.searchParams.get("sortDirection");
    if (rawDirection && !["ASC", "DESC"].includes(rawDirection.toUpperCase())) {
      parseAppError(
        (flash.error = "(Error) Dirección de ordenación inválida."),
        (flash.source = "client")
      );
    }
    const sortDirection = (rawDirection as "ASC" | "DESC") ?? "ASC";

    let accounts: AccountDTO[] | null = null;
    try {
      accounts = await getAllAccounts(includeInactive, {
        sortField,
        sortDirection,
      });
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de cuentas."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    const idParam = url.searchParams.get("id");
    let editingAccount: AccountDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Cuenta");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { accounts, editingAccount, flash };
      }
      const id = Number(idParam);

      try {
        editingAccount = await getAccountById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar la cuenta seleccionada."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingAccount = null;
      }
    }
    return { accounts, editingAccount, flash };
  });
}
