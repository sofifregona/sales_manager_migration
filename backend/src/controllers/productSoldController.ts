import type { Request, Response } from "express";
import {
  createProductSold,
  getProductSoldById,
  updateProductSold,
  deleteProductSold,
} from "../services/productSoldService.js";
import { AppError } from "../errors/AppError.js";

export const createProductSoldHandler = async (req: Request, res: Response) => {
  try {
    const product = await createProductSold(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error al intentar agregar el producto a la venta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const updateProductSoldHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const updated = await updateProductSold({ id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    console.error(
      "Error al intentar modificar el producto en la venta: ",
      error
    );

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const deleteProductSoldHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const product = await deleteProductSold({ id });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al intentar borrar el producto en la venta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};

export const getProductSoldByIdHandler = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id, 10);
  try {
    const product = await getProductSoldById(id);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al intentar acceder al producto de la venta: ", error);

    const isAppError = error instanceof AppError && error.statusCode;
    const status = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Ocurrió un error inesperado";

    res.status(status).json({ message });
  }
};
