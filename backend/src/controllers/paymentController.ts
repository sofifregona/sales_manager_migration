import type { Request, Response } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
} from "../services/paymentService.js";
import { AppError } from "../errors/AppError.js";

export const createPaymentHandler = async (req: Request, res: Response) => {
  try {
    const payment = await createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    console.error("Error al intentar crear el método de pago: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const updatePaymentHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updatePayment({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar el método de pago: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const deactivatePaymentHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const payment = await updatePayment({ id, active: false });
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error al intentar dar de baja el método de pago: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getAllPaymentsHandler = async (_req: Request, res: Response) => {
  try {
    const payments = await getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    console.error(
      "Error al intentar acceder a la lista de métodos de pago: ",
      error
    );

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getPaymentByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const payment = await getPaymentById(id);
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error al intentar acceder al método de pago: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};
