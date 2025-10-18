import argon2 from "argon2";
import { userRepo } from "./user.repo.js";

export async function changeMyPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado");
  if (!user.active) throw new Error("Usuario inactivo");

  const ok = await argon2.verify(user.passwordHash, currentPassword);
  if (!ok) throw new Error("Contraseña actual incorrecta");

  user.passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await userRepo.save(user);
}

export async function resetUserPassword(
  targetUserId: number,
  newPassword: string
) {
  const user = await userRepo.findOne({ where: { id: targetUserId } });
  if (!user) throw new Error("Usuario no encontrado");

  user.passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await userRepo.save(user);
}
