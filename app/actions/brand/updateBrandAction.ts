import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateBrand } from "~/api/brand";
import type { UpdateBrandFormData } from "~/types/brand";
import {
  validateIsInteger,
  validateIsPositive,
  validateNumber,
  validateNumberID,
  validateRequired,
  validateRequiredID,
  validateRequiredAndType,
} from "~/utils/validations/validationHelpers";

export async function updateBrandAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "MARCA");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "MARCA");
  if (idNumberError) return idNumberError;

  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  const data: UpdateBrandFormData = { id, name: (name as string).trim() };

  try {
    await updateBrand(data);
  } catch (error) {
    let parsed = { message: "Error al actualizar la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/brand/edit-success");
}
