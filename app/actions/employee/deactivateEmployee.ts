import { redirect } from "react-router-dom";
import { deactivateEmployee } from "~/api/employee";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function deactivateEmployeeAction({ params }: any) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "Empleado");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "Empleado");
  if (idNumberError) return idNumberError;

  try {
    await deactivateEmployee(id);
  } catch (error) {
    let parsed = {
      message: "Error al dar de baja el empleado",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/employee/list");
}
