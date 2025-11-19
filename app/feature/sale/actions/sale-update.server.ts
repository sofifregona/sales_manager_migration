import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { closeSale, updateSale } from "~/feature/sale/sale-api.server";
import type {
  CloseSalePayload,
  UpdateSalePayload,
} from "~/feature/sale/types/sale";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
  validatePositiveInteger,
  validateRequired,
} from "~/utils/validation/validationHelpers";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { parseCRUDIntent } from "~/utils/validation/intents";

export async function updateSaleAction({
  params,
  request,
}: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const idRequiredError = validateRequiredId(params.id, "Venta");
    if (idRequiredError) return idRequiredError;

    const id = parseInt(params.id as string, 10);
    const idNumberError = validateNumberId(id, "Venta");
    if (idNumberError) {
      return jsonResponse(422, idNumberError);
    }

    const formData = await request.formData();
    const parsedIntent = parseCRUDIntent(formData.get("_action") ?? "update");
    if (!parsedIntent.ok) return parsedIntent.response;

    switch (parsedIntent.intent) {
      case "update":
        return handleProductUpdate(id, formData);
      case "close":
        return handleCloseSale(id, formData);
      default:
        return jsonResponse(400, {
          error: "(Error) Acción no soportada para ventas.",
          source: "client",
        });
    }
  });
}

async function handleProductUpdate(id: number, formData: FormData) {
  const idProductStr = formData.get("idProduct");
  const idProductStrError = validateRequired(idProductStr, "string", "Producto");
  if (idProductStrError) {
    return jsonResponse(422, idProductStrError);
  }

  const idProduct = Number(idProductStr);
  const idProductError = validatePositiveInteger(idProduct, "Producto");
  if (idProductError) {
    return jsonResponse(422, idProductError);
  }

  const opStr = formData.get("op");
  const opStrError = validateRequired(opStr, "string", "Operación");
  if (opStrError) {
    return jsonResponse(422, opStrError);
  }

  if (opStr !== "add" && opStr !== "subtract") {
    return jsonResponse(422, {
      error:
        "(Error) La operación debe ser de adición o sustracción de un producto de la venta",
      source: "client",
    });
  }

  const data: UpdateSalePayload = {
    id,
    product: { idProduct, op: opStr },
  };

  try {
    await updateSale(data);
    return null;
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
}

async function handleCloseSale(id: number, formData: FormData) {
  const idPaymentStr = formData.get("idPayment");
  const idPaymentStrError = validateRequired(
    idPaymentStr,
    "string",
    "Método de pago"
  );
  if (idPaymentStrError) return jsonResponse(422, idPaymentStrError);

  const idPayment = Number(idPaymentStr);
  const idPaymentError = validatePositiveInteger(
    idPayment,
    "Método de pago"
  );
  if (idPaymentError) return jsonResponse(422, idPaymentError);

  const data: CloseSalePayload = { id, idPayment };

  try {
    await closeSale(data);
    return redirect("/sale/order");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo cerrar la venta."
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
