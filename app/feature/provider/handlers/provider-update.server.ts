import { redirect } from "react-router-dom";
import { updateProvider } from "~/feature/provider/provider-api.server";
import type { UpdateProviderPayload } from "~/feature/provider/provider";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateRequired,
  validateRequiredAndType,
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
  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Proveedor");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const payload: UpdateProviderPayload = { id };
  let hasChanges = false;

  if (formData.has("name")) {
    const nameParam = formData.get("name");
    const nameParamError = validateRequiredAndType(
      nameParam,
      "string",
      "Nombre",
    );
    if (nameParamError) return jsonResponse(422, nameParamError);
    payload.name = (nameParam as string).trim();
    hasChanges = true;
  }

  if (formData.has("cuit")) {
    const cuitStr = formData.get("cuit");
    const cuitStrError = validateType(cuitStr, "string", "CUIT");
    if (cuitStrError) return jsonResponse(422, cuitStrError);
    const digits = cuitStr?.toString().replace(/\D/g, "") ?? "";
    if (digits !== "") {
      const cuitNum = Number(digits);
      const cuitErr = validateCUI(cuitNum, 11, "CUIT");
      if (cuitErr) return jsonResponse(422, cuitErr);
      payload.cuit = cuitNum;
    } else {
      payload.cuit = null;
    }
    hasChanges = true;
  }

  if (formData.has("telephone")) {
    const telStr = formData.get("telephone");
    const telStrError = validateType(telStr, "string", "Teléfono");
    if (telStrError) return jsonResponse(422, telStrError);
    const telParsed = telStr?.toString().trim() ?? "";
    if (telParsed !== "") {
      const telNum = Number(telParsed);
      const telErr = validateTelephone(telNum, "Teléfono");
      if (telErr) return jsonResponse(422, telErr);
      payload.telephone = telNum;
    } else {
      payload.telephone = null;
    }
    hasChanges = true;
  }

  if (formData.has("email")) {
    const emailParam = formData.get("email");
    const emailParamErr = validateType(emailParam, "string", "E-mail");
    if (emailParamErr) return jsonResponse(422, emailParamErr);
    const emailParsed = emailParam?.toString().trim() ?? "";
    if (emailParsed !== "") {
      const emailErr = validateEmailFormat(emailParsed);
      if (emailErr) return jsonResponse(422, emailErr);
      payload.email = emailParsed;
    } else {
      payload.email = null;
    }
    hasChanges = true;
  }

  if (formData.has("address")) {
    const addressParam = formData.get("address");
    const addressParamErr = validateType(addressParam, "string", "Domicilio");
    if (addressParamErr) return jsonResponse(422, addressParamErr);
    const addressParsed = addressParam?.toString().trim() ?? "";
    payload.address = addressParsed !== "" ? addressParsed : null;
    hasChanges = true;
  }

  if (!hasChanges) {
    const params = new URLSearchParams(url.search);
    params.set("updated", "1");
    return redirect(`/settings/provider?${params.toString()}`);
  }

  try {
    await updateProvider(payload);
    const p = new URLSearchParams(url.search);
    p.set("updated", "1");
    return redirect(`/settings/provider?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar el proveedor seleccionado.",
    );
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
