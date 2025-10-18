import { redirect } from "react-router-dom";
import { updateProvider } from "~/feature/provider/provider-api.server";
import type { UpdateProviderPayload } from "~/feature/provider/provider";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredId,
  validateType,
} from "~/utils/validation/validationHelpers";
import {
  validateCUI,
  validateEmailFormat,
  validateTelephone,
} from "~/utils/validation/validationPerson";

type Ctx = { url: URL; formData: FormData };

export async function handleProviderUpdate({ url, formData }: Ctx) {
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
    } else {
      cuit = null;
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
      const telErr = validateTelephone(telNum, "Teléfono");
      if (telErr)
        return jsonResponse(422, {
          error: telErr.error,
          source: telErr.source,
        });
      telephone = telNum;
    } else {
      telephone = null;
    }
  }

  let email: string | null = null;
  const emailParam = formData.get("email");
  if (emailParam) {
    const emailParamErr = validateType(emailParam, "string", "E-mail");
    if (emailParamErr)
      return jsonResponse(422, {
        error: emailParamErr.error,
        source: emailParamErr.source,
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
    } else {
      email = null;
    }
  }

  let address: string | null = null;
  const addressParam = formData.get("address");
  if (addressParam) {
    const addressParamErr = validateType(addressParam, "string", "Domicilio");
    if (addressParamErr)
      return jsonResponse(422, {
        error: addressParamErr.error,
        source: addressParamErr.source,
      });
    const addressParsed = addressParam.toString().trim();
    address = addressParsed !== "" ? addressParsed : null;
  }

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Proveedor");
  if (idReqError)
    return jsonResponse(422, {
      error: idReqError.error,
      source: idReqError.source,
    });
  const id = Number(idParam);

  const payload: UpdateProviderPayload = {
    id,
    name,
    cuit,
    telephone,
    email,
    address,
  };

  try {
    await updateProvider(payload);
    return redirect("/provider?updated=1");
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar el proveedor seleccionado."
    );
    if (parsed.status === 409) {
      const conflictField = /CUIT/i.test(parsed.message) ? "cuit" : "name";
      setFlash({
        scope: "provider",
        kind: "update-conflict",
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
