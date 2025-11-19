import type { Request, Response, NextFunction } from "express";
import type { Role } from "../constants/roles.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user)
    return res.status(401).json({ message: "No autenticado" });
  next();
}

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    if (!user || !roles.includes(user.role as Role)) {
      return res.status(403).json({ message: "No autorizado" });
    }
    next();
  };
}
