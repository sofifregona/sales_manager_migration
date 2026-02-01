import type { Request, Response, NextFunction } from "express";
import {
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  reactivatePaymentMethod,
  updatePaymentMethod,
  deactivatePaymentMethod,
  reactivatePaymentMethodSwap,
} from "./payment-method.service.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makePaymentMethodRepository } from "./payment-method.repo.typeorm.js";

const paymentMethodRepo = makePaymentMethodRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createPaymentMethodHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createPaymentMethod(paymentMethodRepo, {
      name: req.body.name,
      idAccount: req.body.idAccount,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentMethodHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const updated = await updatePaymentMethod(paymentMethodRepo, {
      id,
      name: req.body.name,
      idAccount: req.body.idAccount,
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivatePaymentMethodHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const deactivated = await deactivatePaymentMethod(paymentMethodRepo, id);
    res.status(200).json(deactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivatePaymentMethodHandler = async (
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
    const reactivated = await reactivatePaymentMethod(
      paymentMethodRepo,
      id,
      strategy
    );
    res.status(200).json(reactivated);
  } catch (error) {
    next(error);
  }
};

export const reactivateSwapPaymentMethodHandler = async (
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
    const swaped = await reactivatePaymentMethodSwap(paymentMethodRepo, {
      currentId,
      inactiveId,
      strategy,
    });
    res.status(200).json(swaped);
  } catch (error) {
    next(error);
  }
};

export const getAllPaymentMethodsHandler = async (
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
    const paymentMethods = await getAllPaymentMethods(paymentMethodRepo, {
      includeInactive: includeInactive === "1" || includeInactive === "true",
      sortField: sortField ? sortField : "normalizedName",
      sotDirection:
        (sortDirection ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
    });
    res.status(200).json(paymentMethods);
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethodByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const paymentMethod = await getPaymentMethodById(paymentMethodRepo, id);
    res.status(200).json(paymentMethod);
  } catch (error) {
    next(error);
  }
};
