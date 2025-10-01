import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateProvider } from "~/api/provider";
import type { UpdateProviderFormData } from "~/types/provider";
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

export async function updateProviderAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "Proveedor");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "Proveedor");
  if (idNumberError) return idNumberError;

  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "string", "Nombre");
  if (nameError) return nameError;

  // Validations for cuit (input)
  const cuitValue = formData.get("cuit");
  const cuitTypeError = validateType(cuitValue, "string", "CUIT");
  if (cuitTypeError) return cuitTypeError;
  const cuitStr = cuitValue?.toString().replaceAll("-", "").trim() || "";
  let cuit: number | null = null;
  if (cuitStr !== "") {
    // Validations for cuit (parsed)
    const cuitNum = Number(cuitStr);
    const cuitValidation = validateCUI(cuitNum, 11, "CUIT");
    if (cuitValidation) return cuitValidation;
    cuit = cuitNum;
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

  const data: UpdateProviderFormData = {
    id,
    name: name as string,
    cuit: cuit,
    telephone: tel,
    email: email,
    address: address,
  };

  try {
    await updateProvider(data);
  } catch (error) {
    let parsed = {
      message: "Error al actualizar el proveedor.",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/provider/edit-success");
}
