import { redirect } from "react-router-dom";
import { deactivateProvider } from "~/api/provider";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function deactivateProviderAction({ params }: any) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "PROVEEDOR");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "PROVEEDOR");
  if (idNumberError) return idNumberError;

  try {
    await deactivateProvider(id);
  } catch (error) {
    let parsed = {
      message: "Error al dar de baja el proveedor",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/provider/list");
}
