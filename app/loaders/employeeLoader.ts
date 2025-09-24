import type { LoaderFunctionArgs } from "react-router";
import { getAllEmployees, getEmployeeById } from "~/api/employee";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function employeeListLoader() {
  try {
    const employees = await getAllEmployees();
    return employees;
  } catch (error) {
    let parsed = {
      message: "Error al obtener la lista de empleados",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
}

export const employeeLoader = async ({ params }: LoaderFunctionArgs) => {
  const idRequiredError = validateRequiredID(params.id, "EMPLEADO");
  if (idRequiredError) {
    throw new Error(idRequiredError.error);
  }

  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "EMPLEADO");
  if (idNumberError) {
    throw new Error(idNumberError.error);
  }

  try {
    const employee = await getEmployeeById(id);
    return employee;
  } catch (error) {
    let parsed = { message: "Error al obtener el empleado", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
};
