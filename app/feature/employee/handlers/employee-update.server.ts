import { redirect } from "react-router-dom";
import { updateEmployee } from "~/feature/employee/employeeApi.server";
import type { UpdateEmployeePayload } from "~/feature/employee/employee";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequired, validateRequiredId, validateType } from "~/utils/validation/validationHelpers";
import { validateCUI, validateEmailFormat, validateTelephone } from "~/utils/validation/validationPerson";

type Ctx = { url: URL; formData: FormData };

export async function handleEmployeeUpdate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, { error: nameParamError.error, source: nameParamError.source });
  const name = (nameParam as string).trim();

  let dni: number | null = null;
  const dniStr = formData.get("dni");
  if (dniStr) {
    const dniStrError = validateType(dniStr, "string", "DNI");
    if (dniStrError) return jsonResponse(422, { error: dniStrError.error, source: dniStrError.source });
    const dniParsed = dniStr.toString().trim();
    if (dniParsed !== "") {
      const dniNum = Number(dniParsed);
      const dniNumError = validateCUI(dniNum, 8, "DNI");
      if (dniNumError) return jsonResponse(422, { error: dniNumError.error, source: dniNumError.source });
      dni = dniNum;
    } else {
      dni = null;
    }
  }

  let telephone: number | null = null;
  const telStr = formData.get("telephone");
  if (telStr) {
    const telStrError = validateType(telStr, "string", "Teléfono");
    if (telStrError) return jsonResponse(422, { error: telStrError.error, source: telStrError.source });
    const telParsed = telStr.toString().trim();
    if (telParsed !== "") {
      const telNum = Number(telParsed);
      const telError = validateTelephone(telNum, "Teléfono");
      if (telError) return jsonResponse(422, { error: telError.error, source: telError.source });
      telephone = telNum;
    } else {
      telephone = null;
    }
  }

  let email: string | null = null;
  const emailParam = formData.get("email");
  if (emailParam) {
    const emailParamError = validateType(emailParam, "string", "E-mail");
    if (emailParamError) return jsonResponse(422, { error: emailParamError.error, source: emailParamError.source });
    const emailParsed = emailParam.toString().trim();
    if (emailParsed !== "") {
      const emailFormatError = validateEmailFormat(emailParsed);
      if (emailFormatError) return jsonResponse(422, { error: emailFormatError.error, source: emailFormatError.source });
      email = emailParsed;
    } else {
      email = null;
    }
  }

  let address: string | null = null;
  const addressParam = formData.get("address");
  if (addressParam) {
    const addressParamError = validateType(addressParam, "string", "Domicilio");
    if (addressParamError) return jsonResponse(422, { error: addressParamError.error, source: addressParamError.source });
    const addressParsed = addressParam.toString().trim();
    address = addressParsed !== "" ? addressParsed : null;
  }

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Empleado");
  if (idReqError) return jsonResponse(422, { error: idReqError.error, source: idReqError.source });
  const id = Number(idParam);

  const payload: UpdateEmployeePayload = { id, name, dni, telephone, email, address };

  try {
    await updateEmployee(payload);
    return redirect("/employee?updated=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo modificar el empleado seleccionado.");
    if (parsed.status === 409) {
      const conflictField = /DNI/i.test(parsed.message) ? "dni" : "name";
      setFlash({
        scope: "employee",
        kind: "update-conflict",
        message: parsed.message,
        name,
        conflictField,
      } as any);
      return redirect("/employee");
    }
    return jsonResponse(parsed.status ?? 500, { error: parsed.message, source: parsed.source ?? "server" });
  }
}
