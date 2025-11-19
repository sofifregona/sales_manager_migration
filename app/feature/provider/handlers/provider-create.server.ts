import { redirect } from "react-router-dom";
import { createProvider } from "~/feature/provider/provider-api.server";
import type { CreateProviderPayload } from "~/feature/provider/provider";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateType,
} from "~/utils/validation/validationHelpers";
import {
  validateCUI,
  validateEmailFormat,
  validateTelephone,
} from "~/utils/validation/validationPerson";

type Ctx = { url: URL; formData: FormData };

export async function handleProviderCreate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);
  const name = (nameParam as string).trim();

  let cuit: number | null = null;
  const cuitStr = formData.get("cuit");
  if (cuitStr) {
    const cuitStrError = validateType(cuitStr, "string", "CUIT");
    if (cuitStrError) return jsonResponse(422, cuitStrError);
    const digits = cuitStr.toString().replace(/\D/g, "");
    if (digits !== "") {
      const cuitNum = Number(digits);
      const cuitErr = validateCUI(cuitNum, 11, "CUIT");
      if (cuitErr) return jsonResponse(422, cuitErr);
      cuit = cuitNum;
    }
  }

  let telephone: number | null = null;
  const telStr = formData.get("telephone");
  if (telStr) {
    const telStrError = validateType(telStr, "string", "Teléfono");
    if (telStrError) return jsonResponse(422, telStrError);
    const telParsed = telStr.toString().trim();
    if (telParsed !== "") {
      const telNum = Number(telParsed);
      const telError = validateTelephone(telNum, "Teléfono");
      if (telError) return jsonResponse(422, telError);
      telephone = telNum;
    }
  }

  let email: string | null = null;
  const emailParam = formData.get("email");
  if (emailParam) {
    const emailParamError = validateType(emailParam, "string", "E-mail");
    if (emailParamError) return jsonResponse(422, emailParamError);
    const emailParsed = emailParam.toString().trim();
    if (emailParsed !== "") {
      const emailErr = validateEmailFormat(emailParsed);
      if (emailErr) return jsonResponse(422, emailErr);
      email = emailParsed;
    }
  }

  let address: string | null = null;
  const addressParam = formData.get("address");
  if (addressParam) {
    const addressParamError = validateType(addressParam, "string", "Domicilio");
    if (addressParamError) return jsonResponse(422, addressParamError);
    const addressParsed = addressParam.toString().trim();
    if (addressParsed !== "") address = addressParsed;
  }

  const payload: CreateProviderPayload = {
    name,
    cuit,
    telephone,
    email,
    address,
  };

  try {
    await createProvider(payload);
    const p = new URLSearchParams(url.search);
    p.set("created", "1");
    return redirect(`/provider?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo crear el proveedor.");
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}

