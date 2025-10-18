import { redirect } from "react-router-dom";
import { createProvider } from "~/feature/provider/provider-api.server";
import type { CreateProviderPayload } from "~/feature/provider/provider";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
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

type Ctx = { formData: FormData };

export async function handleProviderCreate({ formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError)
    return jsonResponse(422, {
      error: nameParamError.error,
      source: nameParamError.source,
    });
  const name = (nameParam as string).trim();

  let cuit: number | null = null;
  const cuitStr = formData.get("cuit");
  if (cuitStr) {
    const cuitStrError = validateType(cuitStr, "string", "CUIT");
    if (cuitStrError)
      return jsonResponse(422, {
        error: cuitStrError.error,
        source: cuitStrError.source,
      });
    const digits = cuitStr.toString().replace(/\D/g, "");
    if (digits !== "") {
      const cuitNum = Number(digits);
      const cuitErr = validateCUI(cuitNum, 11, "CUIT");
      if (cuitErr)
        return jsonResponse(422, {
          error: cuitErr.error,
          source: cuitErr.source,
        });
      cuit = cuitNum;
    }
  }

  let telephone: number | null = null;
  const telStr = formData.get("telephone");
  if (telStr) {
    const telStrError = validateType(telStr, "string", "Teléfono");
    if (telStrError)
      return jsonResponse(422, {
        error: telStrError.error,
        source: telStrError.source,
      });
    const telParsed = telStr.toString().trim();
    if (telParsed !== "") {
      const telNum = Number(telParsed);
      const telError = validateTelephone(telNum, "Teléfono");
      if (telError)
        return jsonResponse(422, {
          error: telError.error,
          source: telError.source,
        });
      telephone = telNum;
    }
  }

  let email: string | null = null;
  const emailParam = formData.get("email");
  if (emailParam) {
    const emailParamError = validateType(emailParam, "string", "E-mail");
    if (emailParamError)
      return jsonResponse(422, {
        error: emailParamError.error,
        source: emailParamError.source,
      });
    const emailParsed = emailParam.toString().trim();
    if (emailParsed !== "") {
      const emailErr = validateEmailFormat(emailParsed);
      if (emailErr)
        return jsonResponse(422, {
          error: emailErr.error,
          source: emailErr.source,
        });
      email = emailParsed;
    }
  }

  let address: string | null = null;
  const addressParam = formData.get("address");
  if (addressParam) {
    const addressParamError = validateType(addressParam, "string", "Domicilio");
    if (addressParamError)
      return jsonResponse(422, {
        error: addressParamError.error,
        source: addressParamError.source,
      });
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
    return redirect("/provider?created=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo crear el proveedor."
    );
    if (parsed.status === 409) {
      const conflictField = /CUIT/i.test(parsed.message) ? "cuit" : "name";
      setFlash({
        scope: "provider",
        kind: "create-conflict",
        message: parsed.message,
        name,
        conflictField,
      } as any);
      return redirect("/provider");
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
