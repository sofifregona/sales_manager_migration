import type { Request, Response } from "express";
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  reactivateAccount,
  softDeleteAccount,
} from "./account.service.js";
import { AppError } from "../../shared/errors/AppError.js";

export const createAccountHandler = async (req: Request, res: Response) => {
  try {
    const account = await createAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    console.error("Error al intentar crear la cuenta: ", error);
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

export const updateAccountHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const updated = await updateAccount({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar la cuenta: ", error);

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

export const deactivateAccountHandler = async (req: Request, res: Response) => {
  const user = req.session.user;
  if (!user?.role || !["ADMIN"].includes(user?.role)) {
    return res.status(401).json({ message: "No autenticado" });
  }
  const id = parseInt(req.params.id, 10);
  try {
    const strategy = (req.body?.strategy ?? undefined) as
      | "cascade-delete-payments"
      | "cancel"
      | undefined;
    const account = await softDeleteAccount(id, strategy);
    res.status(200).json(account);
  } catch (error) {
    console.error("Error al intentar eliminar la cuenta: ", error);

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

export const reactivateAccountHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const account = await reactivateAccount(id);
    res.status(200).json(account);
  } catch (error) {
    console.error("Error al intentar reactivar la cuenta: ", error);

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

export const getAllAccountsHandler = async (req: Request, res: Response) => {
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "normalizedName" | "active";
    sortDirection: "ASC" | "DESC";
  };

  try {
    const accounts = await getAllAccounts(
      includeInactive === "1" || includeInactive === "true",
      {
        field: sortField ? sortField : "normalizedName",
        direction:
          (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
      }
    );
    res.status(200).json(accounts);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de cuentas: ", error);

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

export const getAccountByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const account = await getAccountById(id);
    res.status(200).json(account);
  } catch (error) {
    console.error("Error al intentar acceder a la cuenta: ", error);

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
