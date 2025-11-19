import type { NextFunction, Request, Response } from "express";
import { authenticate } from "./auth.service.js";
import { makeUserRepository } from "../user/user.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

const userRepo = makeUserRepository(AppDataSource);

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username y password requeridos" });
    }

    const sessionUser = await authenticate(userRepo, { username, password });
    if (!sessionUser) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    req.session.user = sessionUser;
    return res.json(sessionUser);
  } catch (error) {
    return next(error);
  }
}

export function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie("sid", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(204).end();
    });
  } catch (error) {
    return next(error);
  }
}

export function meHandler(req: Request, res: Response, _next: NextFunction) {
  if (!req.session.user)
    return res.status(401).json({ message: "No autenticado" });
  return res.json(req.session.user);
}
