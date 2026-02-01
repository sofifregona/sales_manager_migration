import { redirect } from "react-router-dom";
import { deactivateEmployee } from "~/feature/employee/employee-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleEmployeeDeactivate({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Empleado");
  if (idReqError) return jsonResponse(422, idReqError);
  const idNum = Number(idParam);
  try {
    await deactivateEmployee(idNum);
    const p = new URLSearchParams(url.search);
    p.delete("id");
    p.set("deactivated", "1");
    return redirect(`/settings/employee?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar el empleado seleccionado."
    );
    if (parsed.status === 409 && (parsed as any).code === "EMPLOYEE_IN_USE") {
      return jsonResponse(409, {
        error: parsed.message,
        code: (parsed as any).code,
        details: (parsed as any).details,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
