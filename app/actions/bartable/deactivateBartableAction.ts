import { redirect } from "react-router-dom";
import { deactivateBartable } from "~/api/bartable";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function deactivateBartableAction({ params }: any) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "MESA");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "MESA");
  if (idNumberError) return idNumberError;

  try {
    await deactivateBartable(id);
  } catch (error) {
    let parsed = { message: "Error al dar de baja la mesa", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/bartable/list");
}
