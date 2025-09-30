import type { Request, Response } from "express";
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
} from "../services/accountService.js";
import { AppError } from "../errors/AppError.js";

export const createAccountHandler = async (req: Request, res: Response) => {
  try {
    const account = await createAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    console.error("Error al intentar crear la cuenta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const updateAccountHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const updated = await updateAccount({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar la cuenta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const deactivateAccountHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const account = await updateAccount({ id, active: false });
    res.status(200).json(account);
  } catch (error) {
    console.error("Error al intentar eliminar la cuenta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getAllAccountsHandler = async (_req: Request, res: Response) => {
  try {
    const accounts = await getAllAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de cuentas: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getAccountByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const account = await getAccountById(id);
    res.status(200).json(account);
  } catch (error) {
    console.error("Error al intentar acceder a la cuenta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};
