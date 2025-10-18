import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateSale } from "~/feature/sale/api/sale.server";
import type { UpdateSalePayload } from "~/feature/sale/types/sale";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateType,
  validateRequiredId,
  validatePositiveInteger,
} from "~/utils/validation/validationHelpers";
import { runWithRequest } from "~/lib/http/requestContext.server";

export async function updateSaleAction({
  params,
  request,
}: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    // Validations for ID (param)
    const idRequiredError = validateRequiredId(params.id, "Venta");
    if (idRequiredError) return idRequiredError;

    // Validations for ID (parsed)
    const id = parseInt(params.id as string, 10);
    const idNumberError = validateNumberId(id, "Venta");
    if (idNumberError) {
      return jsonResponse(422, {
        error: idNumberError.error,
        source: idNumberError.source,
      });
    }

    const formData = await request.formData();

    let idPayment: number | undefined = undefined;
    let idProduct: number | undefined = undefined;
    let op: string | undefined = undefined;
    let open: boolean = true;

    const idPaymentStr = formData.get("idPayment");
    if (idPaymentStr) {
      const idPaymentStrError = validateType(
        idPaymentStr,
        "string",
        "M�todo de pago"
      );
      if (idPaymentStrError) {
        return jsonResponse(422, {
          error: idPaymentStrError.error,
          source: idPaymentStrError.source,
        });
      }
      idPayment = Number(idPaymentStr);
      const idPaymentError = validatePositiveInteger(
        idPayment,
        "M�todo de pago"
      );
      if (idPaymentError) {
        return jsonResponse(422, {
          error: idPaymentError.error,
          source: idPaymentError.source,
        });
      }
    }

    const idProductStr = formData.get("idProduct");
    if (idProductStr) {
      // Validations for idProduct (inputs) if exists
      const idProductStrError = validateType(
        idProductStr,
        "string",
        "Producto"
      );
      if (idProductStrError) {
        return jsonResponse(422, {
          error: idProductStrError.error,
          source: idProductStrError.source,
        });
      }
      // Validations for idProduct (number) if exists
      idProduct = Number(idProductStr);
      const idProductError = validatePositiveInteger(idProduct, "Producto");
      if (idProductError) {
        return jsonResponse(422, {
          error: idProductError.error,
          source: idProductError.source,
        });
      }
      // Validations for operation (input)
      const opStr = formData.get("op");
      const opStrError = validateType(opStr, "string", "Operaci�n");
      if (opStrError) {
        return jsonResponse(422, {
          error: opStrError.error,
          source: opStrError.source,
        });
      }
      if (opStr !== "add" && opStr !== "substract")
        return jsonResponse(422, {
          error:
            "(Error) La operaci�n debe ser de adici�n o sustracci�n de un producto de la venta",
          source: "client",
        });
      op = opStr;
    }

    const openStr = formData.get("open");
    if (openStr) {
      const openStrError = validateType(
        openStr,
        "string",
        "Estado de la venta (abierta/cerrada)"
      );
      if (openStrError) {
        return jsonResponse(422, {
          error: openStrError.error,
          source: openStrError.source,
        });
      }
      open = openStr === "true" ? true : false;
    }

    const data: UpdateSalePayload = {
      id,
      idPayment,
      product: { idProduct, op },
      open,
    };

    try {
      await updateSale(data);
      if (!open && idPayment) {
        return redirect(`/sale/order`);
      }
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo modificar la venta."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  });
}
