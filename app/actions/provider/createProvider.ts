import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createProvider } from "~/api/provider";
import type { CreateProviderFormData } from "~/types/provider";
import {
  validateRequiredAndType,
  validateType,
} from "~/utils/validations/validationHelpers";
import {
  validateCUI,
  validateTelephone,
  validateEmailFormat,
} from "~/utils/validations/validationPerson";

export async function createProviderAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  // Validations for cuit (input)
  const cuitValue = formData.get("cuit");
  const cuitTypeError = validateType(cuitValue, "string", "Cuit");
  if (cuitTypeError) return cuitTypeError;
  const cuitStr = cuitValue?.toString().replaceAll("-", "").trim() || "";
  let cuit: number | null = null;
  if (cuitStr !== "") {
    // Validations for cuit (parsed)
    const cuitNum = Number(cuitStr);
    const cuitValidation = validateCUI(cuitNum, "Cuit", 11);
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
  // ******** Quizas agregar una validación de longitud??
  console.log("!!!!! Recordar comentarios en createProvider.ts");

  const data: CreateProviderFormData = {
    name: name as string,
    cuit: cuit,
    telephone: tel,
    email: email,
    address: address,
  };

  try {
    await createProvider(data);
    return redirect("/provider/create-success");
  } catch (error) {
    let parsed = { message: "Error al crear la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
