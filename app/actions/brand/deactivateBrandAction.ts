import { redirect } from "react-router-dom";
import { deactivateBrand } from "~/api/brand";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function deactivateBrandAction({ params }: any) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "MARCA");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "MARCA");
  if (idNumberError) return idNumberError;

  try {
    await deactivateBrand(id);
  } catch (error) {
    let parsed = { message: "Error al dar de baja la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/brand/list");
}
