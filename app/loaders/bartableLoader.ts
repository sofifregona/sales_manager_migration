import type { LoaderFunctionArgs } from "react-router";
import { getAllBartables, getBartableById } from "~/api/bartable";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function bartableListLoader() {
  try {
    const bartables = await getAllBartables();
    return bartables;
  } catch (error) {
    let parsed = { message: "Error al obtener la lista de mesas", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
}

export const bartableLoader = async ({ params }: LoaderFunctionArgs) => {
  const idRequiredError = validateRequiredID(params.id);
  if (idRequiredError) {
    throw new Error(idRequiredError.error);
  }

  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id);
  if (idNumberError) {
    throw new Error(idNumberError.error);
  }

  try {
    const bartable = await getBartableById(id);
    return bartable;
  } catch (error) {
    let parsed = { message: "Error al obtener la mesa", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
};
