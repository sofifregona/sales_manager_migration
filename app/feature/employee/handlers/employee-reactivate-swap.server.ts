import { redirect } from "react-router-dom";
import { reactivateEmployeeSwap } from "~/feature/employee/employeeApi.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { formData: FormData };

export async function handleEmployeeReactivateSwap({ formData }: Ctx) {
  const inactiveIdParam = formData.get("inactiveId");
  const currentIdParam = formData.get("currentId");

  const currentIdReqError = validateRequiredId(currentIdParam, "Empleado actual");
  if (currentIdReqError) return jsonResponse(422, { error: currentIdReqError.error, source: currentIdReqError.source });
  const currentIdNum = Number(currentIdParam);

  const inactiveIdReqError = validateRequiredId(inactiveIdParam, "Empleado inactivo");
  if (inactiveIdReqError) return jsonResponse(422, { error: inactiveIdReqError.error, source: inactiveIdReqError.source });
  const inactiveIdNum = Number(inactiveIdParam);

  try {
    await reactivateEmployeeSwap(inactiveIdNum, currentIdNum);
    return redirect("/employee?reactivated=1");
  } catch (error) {
    const parsed = parseAppError(error, "(Error) No se pudo reactivar el empleado intercambiando los estados.");
    return jsonResponse(parsed.status ?? 500, { error: parsed.message, source: parsed.source ?? "server" });
  }
}
