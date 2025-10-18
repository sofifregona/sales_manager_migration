import { redirect } from "react-router-dom";
import { reactivateEmployee } from "~/feature/employee/employeeApi.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleEmployeeReactivate({ formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Empleado");
  if (idReqError) return jsonResponse(422, { error: idReqError.error, source: idReqError.source });
  const idNum = Number(idParam);
  try {
    await reactivateEmployee(idNum);
    return redirect("/employee?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo reactivar el empleado seleccionado.");
    return jsonResponse(parsed.status ?? 500, { error: parsed.message, source: parsed.source ?? "server" });
  }
}

