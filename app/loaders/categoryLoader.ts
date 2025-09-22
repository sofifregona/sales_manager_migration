import type { LoaderFunctionArgs } from "react-router";
import { getAllCategories, getCategoryById } from "~/api/category";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function categoryListLoader() {
  try {
    const categories = await getAllCategories();
    return categories;
  } catch (error) {
    let parsed = {
      message: "Error al obtener la lista de categorías",
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

export const categoryLoader = async ({ params }: LoaderFunctionArgs) => {
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
    const category = await getCategoryById(id);
    return category;
  } catch (error) {
    let parsed = { message: "Error al obtener la categoría", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
};
