import type { LoaderFunctionArgs } from "react-router";
import { getAllPayments, getPaymentById } from "~/api/payment";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function paymentListLoader() {
  try {
    const payments = await getAllPayments();
    return payments;
  } catch (error) {
    let parsed = {
      message: "Error al obtener la lista de métodos de pago",
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

export const paymentLoader = async ({ params }: LoaderFunctionArgs) => {
  const idRequiredError = validateRequiredID(params.id, "MÉTODO DE PAGO");
  if (idRequiredError) {
    throw new Error(idRequiredError.error);
  }

  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "MÉTODO DE PAGO");
  if (idNumberError) {
    throw new Error(idNumberError.error);
  }

  try {
    const payment = await getPaymentById(id);
    return payment;
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
