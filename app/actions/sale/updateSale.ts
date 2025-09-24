import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { updateSale } from "~/api/sale";
import type { UpdateSaleFormData } from "~/types/sale";
import {
  validateNumberID,
  validateType,
  validateRequiredAndType,
  validateRequiredID,
  validateNumber,
  validatePositiveInteger,
} from "~/utils/validations/validationHelpers";

import {
  validateCUI,
  validateTelephone,
  validateEmailFormat,
} from "~/utils/validations/validationPerson";

export async function updateSaleAction({
  params,
  request,
}: ActionFunctionArgs) {
  // Validations for ID (param)
  const idRequiredError = validateRequiredID(params.id, "PROVEEDOR");
  if (idRequiredError) return idRequiredError;

  // Validations for ID (parsed)
  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "PROVEEDOR");
  if (idNumberError) return idNumberError;

  const formData = await request.formData();

  const idPaymentStr = formData.get("idPayment");
  if (idPaymentStr !== null) {
    const idPaymentStrError = validateType(
      idPaymentStr,
      "string",
      "Método de pago"
    );
    if (idPaymentStrError) return idPaymentStrError;
    const idPaymentNum = Number(idPaymentStr);
    const idPaymentNumError = validatePositiveInteger(
      idPaymentNum,
      "Método de pago"
    );
    if (idPaymentNumError) return idPaymentNumError;
  }

  const productsSold = formData.get("productsSold");
  if (productsSold !== null) {
    productsSold.map((productSold) => {
      validateRequiredID(productSold.id, "Producto agregado a la venta");
    });
  }

  // Validations for name (input)

  const idBartable = formData.get("name");
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

  const data: UpdateSaleFormData = {
    id,
    name: name as string,
    cuit: cuit,
    telephone: tel,
    email: email,
    address: address,
  };

  try {
    await updateSale(data);
  } catch (error) {
    let parsed = {
      message: "Error al actualizar el método de pago",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }

  return redirect("/sale/edit-success");
}
