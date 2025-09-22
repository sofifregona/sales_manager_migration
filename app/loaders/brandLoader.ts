import type { LoaderFunctionArgs } from "react-router";
import { getAllBrands, getBrandById } from "~/api/brand";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function brandListLoader() {
  try {
    const brands = await getAllBrands();
    return brands;
  } catch (error) {
    let parsed = {
      message: "Error al obtener la lista de marcas",
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

export const brandLoader = async ({ params }: LoaderFunctionArgs) => {
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
    const brand = await getBrandById(id);
    return brand;
  } catch (error) {
    let parsed = { message: "Error al obtener la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
};
