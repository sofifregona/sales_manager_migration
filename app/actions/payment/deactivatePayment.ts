import { redirect } from "react-router-dom";
import { deactivatePayment } from "~/api/payment";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function deactivatePaymentAction({ params }: any) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "MÉTODO DE PAGO");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "MÉTODO DE PAGO");
  if (idNumberError) return idNumberError;

  try {
    await deactivatePayment(id);
  } catch (error) {
    let parsed = {
      message: "Error al dar de baja el método de pago",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/payment/list");
}
