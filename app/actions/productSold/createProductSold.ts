import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createProductSold } from "~/api/productSold";
import type { CreateProductSoldFormData } from "~/types/productSold";
import {
  validateFilteredID,
  validateNumberID,
  validatePositiveInteger,
  validatePositiveNumber,
  validateRangeLength,
  validateRequiredAndType,
  validateType,
} from "~/utils/validations/validationHelpers";

export async function createProductAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for idProduct (input)
  const idProductStr = formData.get("idProduct");
  const idProductStrError = validateRequiredAndType(
    idProductStr,
    "Id producto",
    "string"
  );
  if (idProductStrError) return idProductStrError;

  // Validations for idProduct (number)
  const idProduct = Number(idProductStr);
  const idProductError = validatePositiveInteger(idProduct, "Id producto");
  if (idProductError) return idProductError;

  // Validations for units (input)
  const unitsStr = formData.get("units");
  const unitsStrError = validateRequiredAndType(unitsStr, "Unidades", "string");
  if (unitsStrError) return unitsStrError;

  // Validations for units (number)
  const units = Number(unitsStr);
  const unitsError = validatePositiveInteger(units, "Unidades");
  if (unitsError) return unitsError;

  // Validations for price (input)
  const subtotalStr = formData.get("subtotal");
  const subtotalStrError = validateRequiredAndType(
    subtotalStr,
    "Subtotal",
    "string"
  );
  if (subtotalStrError) return subtotalStrError;

  // Validations for price (parsed)
  const subtotal = Number(subtotalStr);
  const subtotalError = validatePositiveNumber(subtotal, "Subtotal");
  if (subtotalError) return subtotalError;

  // Validations for idSale (input)
  const idSaleStr = formData.get("idSale");
  const idSaleStrError = validateRequiredAndType(
    idSaleStr,
    "Id venta",
    "string"
  );
  if (idSaleStrError) return idSaleStrError;

  // Validations for idProduct (number)
  const idSale = Number(idSaleStr);
  const idSaleError = validatePositiveInteger(idSale, "Id producto");
  if (idSaleError) return idSaleError;

  const data: CreateProductSoldFormData = {
    idProduct,
    units,
    subtotal,
    idSale,
  };

  try {
    await createProductSold(data);
    return;
  } catch (error) {
    let parsed = { message: "Error al crear el producto", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
