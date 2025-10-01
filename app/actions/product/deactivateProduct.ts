import { redirect } from "react-router-dom";
import { deactivateProduct } from "~/api/product";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function deactivateProductAction({ params }: any) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "Producto");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "Producto");
  if (idNumberError) return idNumberError;

  try {
    await deactivateProduct(id);
  } catch (error) {
    let parsed = {
      message: "Error al eliminar el producto.",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/product/list");
}
