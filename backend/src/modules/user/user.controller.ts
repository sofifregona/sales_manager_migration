import type { Request, Response } from "express";
import { changeMyPassword, resetUserPassword } from "./user.service.js";

export async function changeMyPasswordHandler(req: Request, res: Response) {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "No autenticado" });

    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword y newPassword son requeridos" });
    }

    await changeMyPassword(
      user.id,
      String(currentPassword),
      String(newPassword)
    );
    return res.status(204).end();
  } catch (err: any) {
    const message = err?.message || "No se pudo cambiar la contraseña";
    return res.status(400).json({ message });
  }
}

export async function resetUserPasswordHandler(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const { newPassword } = req.body ?? {};
    if (!newPassword) {
      return res.status(400).json({ message: "newPassword es requerido" });
    }

    await resetUserPassword(Number(id), String(newPassword));
    return res.status(204).end();
  } catch (err: any) {
    const message = err?.message || "No se pudo resetear la contraseña";
    return res.status(400).json({ message });
  }
}
