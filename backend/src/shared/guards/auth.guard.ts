import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user)
    return res.status(401).json({ message: "No autenticado" });
  next();
}

export function requireRole(roles: Array<"ADMIN" | "MANAGER" | "CASHIER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "No autenticado" });
    if (!roles.includes(user.role))
      return res.status(403).json({ message: "No autorizado" });
    next();
  };
}
