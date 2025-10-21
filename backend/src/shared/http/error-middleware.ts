import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function notFoundMiddleware(_req: Request, res: Response) {
  res
    .status(404)
    .json({ message: "(Error) Recurso no encontrado.", source: "server" });
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode ?? 400).json({
      message: err.message,
      code: err.code,
      details: err.details,
      source: "server",
    });
  }

  // Fallback: error no controlado
  // eslint-disable-next-line no-console
  console.error(err);
  return res
    .status(500)
    .json({ message: "(Error) Error interno del servidor.", source: "server" });
}
