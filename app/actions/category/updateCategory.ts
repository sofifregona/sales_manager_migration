import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateCategory } from "~/api/category";
import type { UpdateCategoryFormData } from "~/types/category";
import {
  validateIsInteger,
  validateIsPositive,
  validateNumber,
  validateNumberID,
  validateRequiredAndType,
  validateRequiredID,
} from "~/utils/validations/validationHelpers";

export async function updateCategoryAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "CATEGORÍA");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "CATEGORÍA");
  if (idNumberError) return idNumberError;

  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  const data: UpdateCategoryFormData = { id, name: (name as string).trim() };

  try {
    await updateCategory(data);
  } catch (error) {
    let parsed = { message: "Error al actualizar la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/category/edit-success");
}
