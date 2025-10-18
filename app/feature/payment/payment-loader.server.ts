import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { getAllPayments, getPaymentById } from "./payment-api.server";
import type { PaymentDTO, PaymentLoaderData } from "./payment";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";
import type { AccountDTO } from "~/feature/account/account";
import { getAllAccounts } from "~/feature/account/account-api.server";

export async function paymentLoader({
  request,
}: LoaderFunctionArgs): Promise<PaymentLoaderData> {
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

    let payments: PaymentDTO[] | null = null;
    try {
      payments = await getAllPayments(includeInactive, {
        sortField,
        sortDirection,
      });
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de métodos de pago."
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

    const idParam = url.searchParams.get("id");
    let editingPayment: PaymentDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Método de pago");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { accounts, payments, editingPayment, flash };
      }

      const id = parseInt(idParam as string, 10);
      try {
        editingPayment = await getPaymentById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar el método de pago seleccionado."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingPayment = null;
      }
    }
    return { accounts, payments, editingPayment, flash };
  });
}
