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

  const idProp = formData.get("idProp");
  const idPropError = validateRequired(idProp, "Correspondencia de venta");
  if (idPropError) return idPropError;
  const idPropStrError = validateType(
    idProp,
    "string",
    "Correspondencia de venta"
  );
  if (idPropStrError) return idPropStrError;
  const idPropStr = idProp!.toString();

  let idBartableNum: number | null = null;
  let idEmployeeNum: number | null = null;
  let hasDiscount: boolean = false;

  if (idPropStr === "bartable") {
    const idBartable = formData.get("idBartable");
    const idBartableError = validateRequiredAndType(
      idBartable,
      "string",
      "ID Mesa"
    );
    if (idBartableError) return idBartableError;
    idBartableNum = Number(idBartable);
    const idBartableNumError = validateNumberID(idBartableNum, "ID Mesa");
    if (idBartableNumError) return idBartableNumError;
  } else if (idPropStr === "employee") {
    const idEmployee = formData.get("idEmployee");
    const idEmployeeError = validateRequiredAndType(
      idEmployee,
      "string",
      "ID Empleado"
    );
    if (idEmployeeError) return idEmployeeError;
    idEmployeeNum = Number(idEmployee);
    const idEmployeeNumError = validateNumberID(idEmployeeNum, "ID Empleado");
    if (idEmployeeNumError) return idEmployeeNumError;
    hasDiscount = true;
  } else {
    return {
      error:
        "Correspondencia de venta: La venta debe estar asociada a una mesa o un empleado",
      source: "client",
    };
  }

  const data: CreateSaleFormData = {
    idBartable: idBartableNum,
    idEmployee: idEmployeeNum,
    hasDiscount,
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
