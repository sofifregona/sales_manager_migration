import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createPayment } from "~/api/payment";
import type { CreatePaymentFormData } from "~/types/payment";
import { validateRequiredAndType } from "~/utils/validations/validationHelpers";

export async function createPaymentAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  const data: CreatePaymentFormData = { name: (name as string).trim() };

  try {
    await createPayment(data);
    return redirect("/payment/create-success");
  } catch (error) {
    let parsed = { message: "Error al crear el método de pago", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
