import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createBartable } from "~/api/bartable";
import type { CreateBartableFormData } from "~/types/bartable";
import {
  validatePositiveInteger,
  validateRequired,
  validateRequiredAndType,
  validateType,
} from "~/utils/validations/validationHelpers";

export async function createBartableAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for number (input)
  const numberStr = formData.get("number");
  const numberStrError = validateRequiredAndType(numberStr, "Número", "string");
  if (numberStrError) return numberStrError;

  // Validations for number (parsed)
  const number = Number(numberStr);
  const numberError = validatePositiveInteger(number, "Número");
  if (numberError) return numberError;

  const data: CreateBartableFormData = { number };

  try {
    await createBartable(data);
    return redirect("/bartable/create-success");
  } catch (error) {
    let parsed = { message: "Error al crear la mesa", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
