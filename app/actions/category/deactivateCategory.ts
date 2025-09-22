import { redirect } from "react-router-dom";
import { deactivateCategory } from "~/api/category";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function deactivateCategoryAction({ params }: any) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "CATEGORÍA");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "CATEGORÍA");
  if (idNumberError) return idNumberError;

  try {
    await deactivateCategory(id);
  } catch (error) {
    let parsed = { message: "Error al dar de baja la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/category/list");
}
