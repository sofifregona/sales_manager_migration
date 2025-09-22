import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateBartable } from "~/api/bartable";
import type { UpdateBartableFormData } from "~/types/bartable";
import {
  validateIsInteger,
  validateIsPositive,
  validateNumber,
  validateNumberID,
  validatePositiveInteger,
  validateRequired,
  validateRequiredAndType,
  validateRequiredID,
} from "~/utils/validations/validationHelpers";

export async function updateBartableAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "MESA");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "MESA");
  if (idNumberError) return idNumberError;

  const formData = await request.formData();

  // Validations for number (input)
  const numberStr = formData.get("number");
  const numberStrError = validateRequiredAndType(numberStr, "Número", "string");
  if (numberStrError) return numberStrError;

  // Validations for number (parsed)
  const number = Number(numberStr);
  const numberError = validatePositiveInteger(number, "Número");
  if (numberError) return numberError;

  const data: UpdateBartableFormData = { id, number };

  try {
    await updateBartable(data);
  } catch (error) {
    let parsed = { message: "Error al actualizar la mesa", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/bartable/edit-success");
}
