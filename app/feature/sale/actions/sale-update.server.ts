import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { paySale, updateSale } from "~/feature/sale/sale-api.server";
import type {
  PaySalePayload,
  UpdateSalePayload,
} from "~/feature/sale/types/sale";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
  validatePositiveInteger,
  validateRequired,
  validateRequiredAndType,
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
      case "pay":
        return handlePaySale(id, formData);
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
  const idProductStrError = validateRequiredAndType(
    idProductStr,
    "string",
    "Producto"
  );
  if (idProductStrError) {
    return jsonResponse(422, idProductStrError);
  }

  const idProduct = Number(idProductStr);
  const idProductError = validatePositiveInteger(idProduct, "Producto");
  if (idProductError) {
    return jsonResponse(422, idProductError);
  }

  const opStr = formData.get("op");
  const opStrError = validateRequiredAndType(opStr, "string", "Operación");
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

async function handlePaySale(id: number, formData: FormData) {
  const idPaymentMethodStr = formData.get("idPayment");
  const idPaymentMethodStrError = validateRequiredAndType(
    idPaymentMethodStr,
    "string",
    "Método de pago"
  );
  if (idPaymentMethodStrError)
    return jsonResponse(422, idPaymentMethodStrError);

  const idPaymentMethod = Number(idPaymentMethodStr);
  const idPaymentMethodError = validatePositiveInteger(
    idPaymentMethod,
    "Método de pago"
  );
  if (idPaymentMethodError) return jsonResponse(422, idPaymentMethodError);
  const data: PaySalePayload = { id, idPaymentMethod };

  try {
    await paySale(data);
    return redirect("/sale/order");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo cerrar la venta.");
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
