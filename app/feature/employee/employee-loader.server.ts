import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import {
  getAllEmployees,
  getEmployeeById,
} from "~/feature/employee/employee-api.server";
import type {
  EmployeeDTO,
  EmployeeLoaderData,
} from "~/feature/employee/employee";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";
// Sorting local en la tabla; el loader solo maneja includeInactive

export async function employeeLoader({
  request,
}: LoaderFunctionArgs): Promise<EmployeeLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {} as Flash;

    const includeInactive = url.searchParams.get("includeInactive") === "1";

    let employees: EmployeeDTO[] | null = null;
    try {
      employees = await getAllEmployees(includeInactive);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de empleados."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    const idParam = url.searchParams.get("id");
    let editingEmployee: EmployeeDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Empleado");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { employees, editingEmployee, flash };
      }

      const id = parseInt(idParam as string, 10);
      try {
        editingEmployee = await getEmployeeById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar el empleado seleccionado."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingEmployee = null;
      }
    }
    return { employees, editingEmployee, flash };
  });
}
