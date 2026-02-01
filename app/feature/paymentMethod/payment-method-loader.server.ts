import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import {
  getAllPaymentMethods,
  getPaymentMethodById,
} from "./payment-method-api.server";
import type {
  PaymentMethodDTO,
  PaymentMethodLoaderData,
} from "./payment-method";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";
import type { AccountDTO } from "~/feature/account/account";
import { getAllAccounts } from "~/feature/account/account-api.server";

export async function paymentMethodLoader({
  request,
}: LoaderFunctionArgs): Promise<PaymentMethodLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {} as Flash;

    const includeInactive = url.searchParams.get("includeInactive") === "1";

    let paymentMethods: PaymentMethodDTO[] | null = null;
    try {
      paymentMethods = await getAllPaymentMethods(includeInactive);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de mÃ©todos de pago."
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
    let editingPaymentMethod: PaymentMethodDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "MÃ©todo de pago");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { accounts, paymentMethods, editingPaymentMethod, flash };
      }

      const id = parseInt(idParam as string, 10);
      try {
        editingPaymentMethod = await getPaymentMethodById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar el mÃ©todo de pago seleccionado."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingPaymentMethod = null;
      }
    }
    return { accounts, paymentMethods, editingPaymentMethod, flash };
  });
}
