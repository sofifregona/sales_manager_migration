import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updatePayment } from "~/api/payment";
import type { UpdatePaymentFormData } from "~/types/payment";
import {
  validateNumberID,
  validateRequiredAndType,
  validateRequiredID,
} from "~/utils/validations/validationHelpers";

export async function updatePaymentAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "MÉTODO DE PAGO");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "MÉTODO DE PAGO");
  if (idNumberError) return idNumberError;

  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  const data: UpdatePaymentFormData = { id, name: (name as string).trim() };

  try {
    await updatePayment(data);
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

  return redirect("/payment/edit-success");
}
