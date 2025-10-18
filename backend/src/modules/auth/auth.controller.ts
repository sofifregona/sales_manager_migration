import type { Request, Response } from "express";
import { authenticate } from "./auth.service.js";

export async function loginHandler(req: Request, res: Response) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username y password requeridos" });
    }

    console.log("ANTES DE LA SESION");
    const sessionUser = await authenticate(username, password);
    if (!sessionUser) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    req.session.user = sessionUser;
    console.log("SESION");
    console.log(sessionUser);
    return res.json(sessionUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error interno" });
  }
}

export function logoutHandler(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.clearCookie("sid");
    return res.status(204).end();
  });
}

export function meHandler(req: Request, res: Response) {
  console.log("DENTRO DEL HANDLER DEL ME");
  console.log(req.session.user);
  if (!req.session.user)
    return res.status(401).json({ message: "No autenticado" });
  return res.json(req.session.user);
}
