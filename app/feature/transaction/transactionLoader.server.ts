import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import {
  getListOfTransactions,
  getTransactionById,
} from "~/feature/transaction/transactionApi.server";
// Types
import type {
  TransactionDTO,
  TransactionLoaderData,
} from "~/feature/transaction/transaction";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
// Helpers
import {
  validateRequiredId,
  validateNumberId,
} from "~/utils/validation/validationHelpers";
import type { AccountDTO } from "~/feature/account/account";
import { getAllAccounts } from "~/feature/account/account-api.server";
import { formatDateTime } from "~/utils/formatters/formatDateTime";

export async function transactionLoader({
  request,
}: LoaderFunctionArgs): Promise<TransactionLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const created = url.searchParams.get("created") === "1";
    const updated = url.searchParams.get("updated") === "1";
    const deleted = url.searchParams.get("deleted") === "1";

    const flash: Flash = { created, updated, deleted };
    const today = formatDateTime(new Date(), "yyyy-mm-dd");
    let filter: {
      startedDate?: string;
      finalDate?: string;
    } = { startedDate: today, finalDate: today };

    const sDate = url.searchParams.get("startedDate");
    const fDate = url.searchParams.get("finalDate");

    if (sDate) {
      const i_date = new Date(sDate);
      if (fDate) {
        const f_date = new Date(fDate);
        if (i_date > f_date) {
          flash.error =
            "(Error) La fecha inicial no puede ser posterior a la fecha final.";
          flash.source = "client";
        }
        filter = { startedDate: sDate, finalDate: fDate };
      } else {
        flash.error =
          "(Error) Debe introducir una fecha final, igual o posterior a la fecha inicial.";
        flash.source = "client";
      }
    }

    let transactions: TransactionDTO[] | null = null;

    try {
      transactions = await getListOfTransactions(filter);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de transacciones."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    let accounts: AccountDTO[] = [];

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

    let editingTransaction: TransactionDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Transacción");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { accounts, transactions, editingTransaction, flash };
      }

      const id = parseInt(idParam as string, 10);
      const idError = validateNumberId(id, "Transacción");
      if (idError) {
        flash.error = idError.error;
        flash.source = idError.source;
        return { accounts, transactions, editingTransaction, flash };
      }

      try {
        editingTransaction = await getTransactionById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar la Transacción seleccionada."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingTransaction = null;
      }
    }
    return { accounts, transactions, editingTransaction, flash };
  });
}
