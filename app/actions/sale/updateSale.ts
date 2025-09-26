import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateSale } from "~/api/sale";
import type { UpdateSaleFormData } from "~/types/sale";
import {
  validateNumberID,
  validateType,
  validateRequiredID,
  validatePositiveInteger,
} from "~/utils/validations/validationHelpers";

export async function updateSaleAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "VENTA");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "VENTA");
  if (idNumberError) return idNumberError;

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
      "Método de pago"
    );
    if (idPaymentStrError) return idPaymentStrError;
    idPayment = Number(idPaymentStr);
    const idPaymentError = validatePositiveInteger(idPayment, "Método de pago");
    if (idPaymentError) return idPaymentError;
  }

  const idProductStr = formData.get("idProduct");
  if (idProductStr) {
    // Validations for idProduct (inputs) if exists
    const idProductStrError = validateType(
      idProductStr,
      "string",
      "Id producto"
    );
    if (idProductStrError) return idProductStrError;
    // Validations for idProduct (number) if exists
    idProduct = Number(idProductStr);
    const idProductError = validatePositiveInteger(idProduct, "Id producto");
    if (idProductError) return idProductError;
    // Validations for operation (input)
    const opStr = formData.get("op");
    const opStrError = validateType(
      opStr,
      "string",
      "Operación (adición/sustracción"
    );
    if (opStrError) return opStrError;
    if (opStr !== "add" && opStr !== "substract")
      return {
        error:
          "La operación debe ser de adición o sustracción de un producto de la venta",
        source: "client",
      };
    op = opStr;
  }

  const openStr = formData.get("open");
  if (openStr) {
    const openStrError = validateType(
      openStr,
      "boolean",
      "Estado de la venta (abierta/cerrada)"
    );
    if (openStrError) return openStrError;
    open = openStr === "true" ? true : false;
  }

  const data: UpdateSaleFormData = {
    id,
    idPayment,
    product: { idProduct, op },
    open,
  };

  try {
    await updateSale(data);
  } catch (error) {
    let parsed = {
      message: "Error al actualizar el método de pago",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return;
}
