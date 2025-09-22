import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { incrementProduct } from "~/api/product";
import type { IncrementProductFormData } from "~/types/product";
import {
  validateNumberID,
  validateType,
  validateRequiredAndType,
  validateRequiredID,
  validatePositiveInteger,
  validateNoEmptyList,
} from "~/utils/validations/validationHelpers";

export async function incrementPriceAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const idsForm = formData.getAll("ids");
  const list: number[] = [];

  for (const idStrForm of idsForm) {
    const idStrError = validateRequiredAndType(idStrForm, "ID", "string");
    if (idStrError) return idStrError;
    const idStr = (idStrForm as string).trim();
    // Validations for ID
    const idRequiredError = validateRequiredID(idStr, "PRODUCTO");
    if (idRequiredError) return idRequiredError;

    // Validations for ID (parsed)
    const id = parseInt(idStr as string, 10);
    const idNumberError = validateNumberID(id, "PRODUCTO");
    if (idNumberError) return idNumberError;

    list.push(id);
  }

  const ids = [...new Set(list)];
  const emptyListError = validateNoEmptyList(ids, "productos");
  if (emptyListError) return emptyListError;

  // Validations for price (input)
  const percentStr = formData.get("percent");
  const percentStrError = validateRequiredAndType(
    percentStr,
    "Precio",
    "string"
  );
  if (percentStrError) return percentStrError;

  // Validations for price (parsed)
  const percent = Number(percentStr);
  const ErrorPercent = validatePositiveInteger(percent, "Precio");
  if (ErrorPercent) return ErrorPercent;

  const data: IncrementProductFormData = {
    ids,
    percent,
  };

  try {
    await incrementProduct(data);
  } catch (error) {
    let parsed = {
      message: "Error al actualizar el producto",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/product/list");
}
