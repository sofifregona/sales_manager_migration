import type { Request, Response, NextFunction } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  reactivatePayment,
  updatePayment,
  softDeletePayment,
  reactivatePaymentSwap,
} from "./payment.service.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makePaymentRepository } from "./payment.repo.typeorm.js";

const paymentRepo = makePaymentRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createPayment(paymentRepo, {
      name: req.body.name,
      idAccount: req.body.idAccount,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const updated = await updatePayment(paymentRepo, {
      id,
      name: req.body.name,
      idAccount: req.body.idAccount,
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivatePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const deactivated = await softDeletePayment(paymentRepo, id);
    res.status(200).json(deactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivatePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const strategy = req.body?.strategy as
      | "reactivate-account"
      | "cancel"
      | undefined;
    const reactivated = await reactivatePayment(paymentRepo, id, strategy);
    res.status(200).json(reactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivateSwapPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentId = Number.parseInt(req.body.currentId, 10);
  const inactiveId = Number.parseInt(req.params.inactiveId, 10);
  try {
    const strategy = req.body?.strategy as
      | "reactivate-account"
      | "cancel"
      | undefined;
    const swaped = await reactivatePaymentSwap(paymentRepo, {
      currentId,
      inactiveId,
      strategy,
    });
    res.status(200).json(swaped);
  } catch (error) {
    next(error);
  }
};

export const getAllPaymentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { includeInactive, sortField, sortDirection } = req.query as {
    includeInactive: string;
    sortField: "normalizedName" | "active";
    sortDirection: "ASC" | "DESC";
  };
  try {
    const payments = await getAllPayments(paymentRepo, {
      includeInactive: includeInactive === "1" || includeInactive === "true",
      sortField: sortField ? sortField : "normalizedName",
      sotDirection:
        (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
    });
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

export const getPaymentByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const payment = await getPaymentById(paymentRepo, id);
    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
};
