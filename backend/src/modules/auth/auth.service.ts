import argon2 from "argon2";
import { userRepo } from "@back/src/modules/user/user.repo.js";
import type { User } from "@back/src/modules/user/user.entity.js";

export type SessionUser = {
  id: number;
  username: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
};

export async function authenticate(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const user = await userRepo.findOne({ where: { username } });
  console.log(user);
  console.log(password);
  if (!user) return null;

  const ok = await argon2.verify(user.passwordHash, password);
  console.log("ESTAMOS EN EL SERVICE");
  console.log(ok);
  if (!ok) return null;

  return toSessionUser(user);
}

export function toSessionUser(user: User): SessionUser {
  console.log(user);
  return { id: user.id, username: user.username, role: user.role };
}
