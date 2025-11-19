import type { Request, Response } from "express";
import {
  createTransaction,
  getListOfTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "./transaction.service.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

export const createTransactionHandler = async (req: Request, res: Response) => {
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const transaction = await createTransaction({
      ...req.body,
      createdById: sessionUser.id,
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error al intentar crear la transacción: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const updateTransactionHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateTransaction({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar la transacción: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const deleteTransactionHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const transaction = await deleteTransaction(id); //MODIFICAR!!
    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error al intentar eliminar la transacción: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getListOfTransactionsHandler = async (
  req: Request,
  res: Response
) => {
  const { startedDate, finalDate, origin } = req.query;
  if (!["all", "sale", "movement"].includes(origin!.toString())) {
    return res.status(422).json({ message: "Operación no soportada" });
  }
  try {
    const transactions = await getListOfTransactions({
      startedDate: startedDate!.toString(),
      finalDate: finalDate!.toString(),
      origin: origin!.toString() as "all" | "sale" | "movement",
    });
    console.log(transactions);
    res.status(200).json(transactions);
  } catch (error) {
    console.error(
      "Error al intentar acceder a la lista de transacciones: ",
      error
    );

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getTransactionByIdHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const transaction = await getTransactionById(id);
    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error al intentar acceder al proveedor: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};
