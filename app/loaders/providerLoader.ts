import type { LoaderFunctionArgs } from "react-router";
import { getAllProviders, getProviderById } from "~/api/provider";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function providerListLoader() {
  try {
    const providers = await getAllProviders();
    return providers;
  } catch (error) {
    let parsed = {
      message: "Error al obtener la lista de proveedores",
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

export const providerLoader = async ({ params }: LoaderFunctionArgs) => {
  const idRequiredError = validateRequiredID(params.id, "PROVEEDOR");
  if (idRequiredError) {
    throw new Error(idRequiredError.error);
  }

  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "PROVEEDOR");
  if (idNumberError) {
    throw new Error(idNumberError.error);
  }

  try {
    const provider = await getProviderById(id);
    return provider;
  } catch (error) {
    let parsed = { message: "Error al obtener el método de pago", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
};
