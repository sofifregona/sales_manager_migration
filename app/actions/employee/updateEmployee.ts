import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateEmployee } from "~/api/employee";
import type { UpdateEmployeeFormData } from "~/types/employee";
import {
  validateNumberID,
  validateType,
  validateRequiredAndType,
  validateRequiredID,
} from "~/utils/validations/validationHelpers";

import {
  validateCUI,
  validateTelephone,
  validateEmailFormat,
} from "~/utils/validations/validationPerson";

export async function updateEmployeeAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "Empleado");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "Empleado");
  if (idNumberError) return idNumberError;

  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "string", "Nombre");
  if (nameError) return nameError;

  // Validations for dni (input)
  const dniValue = formData.get("dni");
  const dniTypeError = validateType(dniValue, "string", "DNI");
  if (dniTypeError) return dniTypeError;
  const dniStr = dniValue?.toString().replaceAll(".", "").trim() || "";
  let dni: number | null = null;
  if (dniStr !== "") {
    // Validations for dni (parsed)
    const dniNum = Number(dniStr);
    const dniValidation = validateCUI(dniNum, 8, "DNI");
    if (dniValidation) return dniValidation;
    dni = dniNum;
  }

  // Validations for telephone (input)
  const telValue = formData.get("telephone");
  const telTypeError = validateType(telValue, "string", "Teléfono");
  if (telTypeError) return telTypeError;
  const telStr = telValue?.toString().trim() || "";
  let tel: number | null = null;
  if (telStr !== "") {
    // Validation for telephone (parsed)
    const telNum = Number(telStr);
    const telValidation = validateTelephone(telNum, "Teléfono");
    if (telValidation) return telValidation;
    tel = telNum;
  }

  // Validations for email (input)
  const emailValue = formData.get("email");
  const emailTypeError = validateType(emailValue, "string", "E-mail");
  if (emailTypeError) return emailTypeError;
  const emailStr = emailValue?.toString().trim() || "";
  let email: string | null = null;
  if (emailStr !== "") {
    const emailFormat = validateEmailFormat(emailStr);
    if (emailFormat) return emailFormat;
    email = emailStr;
  }

  const addressValue = formData.get("address");
  const addressTypeError = validateType(addressValue, "string", "Dirección");
  if (addressTypeError) return addressTypeError;
  const address = addressValue?.toString().trim() || null;

  const data: UpdateEmployeeFormData = {
    id,
    name: name as string,
    dni: dni,
    telephone: tel,
    email: email,
    address: address,
  };

  try {
    await updateEmployee(data);
  } catch (error) {
    let parsed = {
      message: "Error al actualizar el empleado.",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/employee/edit-success");
}
