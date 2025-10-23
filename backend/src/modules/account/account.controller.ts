import type { Request, Response, NextFunction } from "express";
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  reactivateAccount,
  reactivateSwapAccount,
  softDeleteAccount,
} from "./account.service.js";
import { makeAccountRepository } from "./account.repo.typeorm.js";
import { makePaymentRepository } from "../payment/payment.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

const accountRepo = makeAccountRepository(AppDataSource);
const paymentRepo = makePaymentRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createAccount(accountRepo, {
      name: req.body.name,
      description: req.body.description ?? null,
    });
    res.status(201).json(created);
  } catch (error) {
    console.log("ACÁ PONEMOR EL ERROR");
    console.log(error);
    next(error);
  }
};

export const updateAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const updated = await updateAccount(accountRepo, {
      id,
      name: req.body.name,
      description: req.body.description,
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  const strategy = (req.body?.strategy ?? undefined) as
    | "cascade-delete-payments"
    | "cancel"
    | undefined;
  try {
    const deactivated = await softDeleteAccount(
      accountRepo,
      paymentRepo,
      id,
      strategy
    );
    res.status(200).json(deactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivateAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("DENTRO DEL HANDLER DE ACCOUNT REACTIVATE");
  console.log(req);
  const id = parseId(req);
  try {
    const reactivated = await reactivateAccount(accountRepo, id);
    res.status(200).json(reactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivateSwapAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("DENTRO DEL CONTROLLER");
  const currentId = Number.parseInt(req.body.currentId, 10);
  const inactiveId = Number.parseInt(req.params.inactiveId, 10);
  const strategy = (req.body?.strategy ?? undefined) as
    | "cascade-delete-payments"
    | "cancel"
    | undefined;
  try {
    const swaped = await reactivateSwapAccount(
      accountRepo,
      { currentId, inactiveId, strategy },
      paymentRepo
    );
    res.status(200).json(swaped);
  } catch (error) {
    next(error);
  }
};

export const getAllAccountsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Dentro del handler");
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "normalizedName" | "active";
    sortDirection: "ASC" | "DESC";
  };

  try {
    const accounts = await getAllAccounts(accountRepo, {
      includeInactive: includeInactive === "1" || includeInactive === "true",
      sortField: sortField ?? "normalizedName",
      sotDirection:
        (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
    });
    res.status(200).json(accounts);
  } catch (error) {
    next(error);
  }
};

export const getAccountByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const account = await getAccountById(accountRepo, id);
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};
