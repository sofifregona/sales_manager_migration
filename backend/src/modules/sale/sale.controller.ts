import type { Request, Response } from "express";
import {
  createSale,
  updateSale,
  getAllOpenSales,
  getSaleById,
  getListOfSales,
  deleteSale,
} from "./sale.service.js";
import { AppError } from "../../shared/errors/AppError.js";

export const createSaleHandler = async (req: Request, res: Response) => {
  try {
    const sale = await createSale(req.body);
    res.status(201).json(sale);
  } catch (error) {
    console.error("Error al intentar crear la venta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const updateSaleHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const updated = await updateSale({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error al intentar modificar la venta: ", error);
    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";
    res.status(status).json({ message });
  }
};

export const deleteSaleHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const sale = await deleteSale(id);
    res.status(200).json(sale);
  } catch (error) {
    console.error("Error al intentar eliminar la venta: ", error);
    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";
    res.status(status).json({ message });
  }
};

export const getAllSalesHandler = async (_req: Request, res: Response) => {
  try {
    const sales = await getAllOpenSales();
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error al intentar acceder a la lista de mesas: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getListOfSalesHandler = async (req: Request, res: Response) => {
  const { startedDate, finalDate, groupBy } = req.query;
  console.log("DENTRO DEL HANDLER");
  console.log(groupBy);
  try {
    const totalSales = await getListOfSales({
      startedDate: startedDate!.toString(),
      finalDate: finalDate!.toString(),
      groupBy: groupBy!.toString(),
    });
    res.status(200).json(totalSales);
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

export const getSaleByIdHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const sale = await getSaleById(id);
    res.status(200).json(sale);
  } catch (error) {
    console.error("Error al intentar acceder al proveedor: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};
