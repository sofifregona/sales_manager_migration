import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createSale } from "~/api/sale";
import type { CreateSaleFormData } from "~/types/sale";
import {
  validateNumberID,
  validateRequired,
  validateRequiredAndType,
  validateType,
} from "~/utils/validations/validationHelpers";

export async function createSaleAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for idProp (input)
  const prop = formData.get("idProp");
  const propError = validateRequiredAndType(
    prop,
    "Correspondencia de venta",
    "string"
  );
  if (propError) return propError;

  let idBartable: number | null = null;
  let idEmployee: number | null = null;

  if (prop === "bartable") {
    const idBartableStr = formData.get("idBartable");
    // Validations for idBartable (input) if exists
    const idBartableStrError = validateRequiredAndType(
      idBartableStr,
      "ID Mesa",
      "string"
    );
    if (idBartableStrError) return idBartableStrError;

    // Validations for idBartable (number) if exists
    idBartable = Number(idBartableStr);
    const idBartableError = validateNumberID(idBartable, "ID Mesa");
    if (idBartableError) return idBartableError;
  } else if (prop === "employee") {
    const idEmployeeStr = formData.get("idEmployee");

    // Validations for idEmployee (inputs) if exists
    const idEmployeeStrError = validateRequiredAndType(
      idEmployee,
      "ID Empleado",
      "string"
    );
    if (idEmployeeStrError) return idEmployeeStrError;

    // Validations for idEmployee (number) if exists
    idEmployee = Number(idEmployeeStr);
    const idEmployeeError = validateNumberID(idEmployee, "ID Empleado");
    if (idEmployeeError) return idEmployeeError;
  } else {
    return {
      error:
        "Correspondencia de venta: La venta debe estar asociada a una mesa o un empleado",
      source: "client",
    };
  }

  const data: CreateSaleFormData = {
    idBartable,
    idEmployee,
  };

  try {
    const newSale = await createSale(data);

    return redirect(`/sale/${newSale.id}/edit`);
  } catch (error) {
    let parsed = { message: "Error al crear la venta", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
