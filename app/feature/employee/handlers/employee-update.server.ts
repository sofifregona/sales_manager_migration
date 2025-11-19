import { redirect } from "react-router-dom";
import { updateEmployee } from "~/feature/employee/employee-api.server";
import type { UpdateEmployeePayload } from "~/feature/employee/employee";
import { jsonResponse } from "~/lib/http/jsonResponse";
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
// No usamos cookies de conflicto para employee (reactivación solo desde tabla)

type Ctx = { url: URL; formData: FormData };

export async function handleEmployeeUpdate({ url, formData }: Ctx) {
  const nameParam = formData.get("name");
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) return jsonResponse(422, nameParamError);
  const name = (nameParam as string).trim();

  let dni: number | null = null;
  const dniStr = formData.get("dni");
  if (dniStr) {
    const dniStrError = validateType(dniStr, "string", "DNI");
    if (dniStrError) return jsonResponse(422, dniStrError);
    const dniParsed = dniStr.toString().trim();
    if (dniParsed !== "") {
      const dniNum = Number(dniParsed);
      const dniNumError = validateCUI(dniNum, 8, "DNI");
      if (dniNumError) return jsonResponse(422, dniNumError);
      dni = dniNum;
    } else {
      dni = null;
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
    } else {
      telephone = null;
    }
  }

  let email: string | null = null;
  const emailParam = formData.get("email");
  if (emailParam) {
    const emailParamError = validateType(emailParam, "string", "E-mail");
    if (emailParamError) return jsonResponse(422, emailParamError);
    const emailParsed = emailParam.toString().trim();
    if (emailParsed !== "") {
      const emailFormatError = validateEmailFormat(emailParsed);
      if (emailFormatError) return jsonResponse(422, emailFormatError);
      email = emailParsed;
    } else {
      email = null;
    }
  }

  let address: string | null = null;
  const addressParam = formData.get("address");
  if (addressParam) {
    const addressParamError = validateType(addressParam, "string", "Domicilio");
    if (addressParamError) return jsonResponse(422, addressParamError);
    const addressParsed = addressParam.toString().trim();
    address = addressParsed !== "" ? addressParsed : null;
  }

  const idParam = url.searchParams.get("id");
  const idReqError = validateRequiredId(idParam, "Empleado");
  if (idReqError) return jsonResponse(422, idReqError);
  const id = Number(idParam);

  const updatedData: UpdateEmployeePayload = {
    id,
    name,
    dni,
    telephone,
    email,
    address,
  };

  try {
    await updateEmployee(updatedData);
    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("updated", "1");
    return redirect(`/employee?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar el empleado seleccionado."
    );

    if (parsed.status === 409) {
      const code = String(parsed.code || "").toUpperCase();
      if (code === "EMPLOYEE_EXISTS_INACTIVE") {
        return jsonResponse(409, {
          error:
            "Ya existe un empleado inactivo con estos datos. Para reactivarlo búsquelo en la tabla (click en 'Ver inactivos').",
          source: parsed.source ?? "server",
          code: parsed.code,
        });
      }
      return jsonResponse(409, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
