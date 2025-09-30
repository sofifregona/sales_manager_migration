import type { LoaderFunctionArgs } from "react-router";
import { getAllAccounts, getAccountById } from "~/api/account";
// Types
import type { Account } from "~/types/account";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/utils/helpers/jsonResponse";
import { parseAppError } from "~/utils/helpers/parseAppError";
// Helpers
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function accountLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  const created = url.searchParams.get("created") === "1";
  const updated = url.searchParams.get("updated") === "1";
  const deleted = url.searchParams.get("deleted") === "1";

  let accounts: Account[] | null = null;
  try {
    accounts = await getAllAccounts();
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

  let editingAccount: Account | null = null;
  const flash: Flash = { created, updated, deleted };

  if (idParam) {
    const idRequiredError = validateRequiredID(idParam, "Cuenta");
    if (idRequiredError) {
      flash.error = idRequiredError.error;
      flash.source = idRequiredError.source;
      return { accounts, editingAccount, flash };
    }

    const id = parseInt(idParam as string, 10);
    const idError = validateNumberID(id, "Cuenta");
    if (idError) {
      flash.error = idError.error;
      flash.source = idError.source;
      return { accounts, editingAccount, flash };
    }

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
}
