import type { NextFunction, Request, Response } from "express";
import {
  createSale,
  updateSale,
  getAllOpenSales,
  getSaleById,
  getOpenSaleById,
  getListOfSales,
  deleteSale,
  paySale,
} from "./sale.service.js";
import { AppError } from "../../shared/errors/AppError.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makeSaleRepository } from "./sale.repo.typeorm.js";

const saleRepo = makeSaleRepository(AppDataSource);

export const createSaleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const sale = await createSale(saleRepo, {
      ...req.body,
      createdById: sessionUser.id,
    });
    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
};

export const updateSaleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const updated = await updateSale(saleRepo, { id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const paySaleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  const { settlementMode, partialStrategy, ...rest } = req.body;
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const updated = await paySale(saleRepo, {
      id,
      settlementMode,
      partialStrategy,
      paymentDetails: { ...rest, createdById: sessionUser.id },
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSaleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const sale = await deleteSale(saleRepo, {
      id,
      force: sessionUser.role === "ADMIN",
    });
    res.status(200).json(sale);
  } catch (error) {
    next(error);
  }
};

export const getAllSalesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sales = await getAllOpenSales(saleRepo);
    res.status(200).json(sales);
  } catch (error) {
    next(error);
  }
};

export const getListOfSalesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("DENTRO DEL HANDLER");
  const { startedDate, finalDate, groupBy } = req.query;
  console.log(groupBy);
  try {
    const totalSales = await getListOfSales(saleRepo, {
      startedDate: startedDate!.toString(),
      finalDate: finalDate!.toString(),
      groupBy: groupBy!.toString(),
    });
    res.status(200).json(totalSales);
  } catch (error) {
    next(error);
  }
};

export const getSaleByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const includeClosed = req.query.includeClosedSales === "true";
    const openOnly = !includeClosed;
    const sale = openOnly
      ? await getOpenSaleById(saleRepo, id)
      : await getSaleById(saleRepo, id);
    res.status(200).json(sale);
  } catch (error) {
    next(error);
  }
};
