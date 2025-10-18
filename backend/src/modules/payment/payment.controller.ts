import type { Request, Response } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  reactivatePayment,
  updatePayment,
} from "./payment.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

export const createPaymentHandler = async (req: Request, res: Response) => {
  try {
    console.log("handler");
    console.log(req.body);
    const payment = await createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    console.error("Error al intentar crear el método de pago: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
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
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const deactivatePaymentHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const payment = await updatePayment({ id, active: false });
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error al intentar eliminar el método de pago: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const reactivatePaymentHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const brand = await reactivatePayment(id);
    res.status(200).json(brand);
  } catch (error) {
    console.error("Error al intentar reactivar la marca: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};

export const getAllPaymentsHandler = async (req: Request, res: Response) => {
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "name" | "active";
    sortDirection: "ASC" | "DESC";
  };
  try {
    const payments = await getAllPayments(
      includeInactive === "1" || includeInactive === "true",
      {
        field: sortField ? sortField : "name",
        direction:
          (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
      }
    );
    res.status(200).json(payments);
  } catch (error) {
    console.error(
      "Error al intentar acceder a la lista de métodos de pago: ",
      error
    );

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
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
    const body: any = {
      message: isAppError
        ? (error as AppError).message
        : "Ocurrió un error inesperado",
    };
    if (isAppError) {
      const e = error as AppError;
      if (e.code) body.code = e.code;
      if (e.details) body.details = e.details;
    }
    res.status(status).json(body);
  }
};
