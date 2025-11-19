import argon2 from "argon2";
import { type UserRepository } from "../user/user.repo.js";
import type { User } from "@back/src/modules/user/user.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import type { Role } from "@back/src/shared/constants/roles.js";

export type SessionUser = {
  id: number;
  username: string;
  role: Role;
};

export async function authenticate(
  repo: UserRepository,
  data: { username: string; password: string }
): Promise<SessionUser | null> {
  const userParam = (data.username ?? "").trim().toLowerCase();
  const user = await repo.findByUsername(userParam);
  if (!user) {
    throw new AppError(
      "(Error) Credenciales inválidas",
      401,
      "AUTH_INVALID_CREDENTIALS"
    );
  }
  if (!user.active) {
    throw new AppError(
      "(Error) El usuario está inactivo",
      403,
      "AUTH_USER_INACTIVE",
      {
        userId: user.id,
      }
    );
  }

  const ok = await argon2.verify(user.passwordHash, data.password);
  if (!ok) {
    throw new AppError(
      "(Error) Credenciales inválidas",
      401,
      "AUTH_INVALID_CREDENTIALS"
    );
  }

  return toSessionUser(user);
}

export function toSessionUser(user: User): SessionUser {
  return { id: user.id, username: user.username, role: user.role as Role };
}

