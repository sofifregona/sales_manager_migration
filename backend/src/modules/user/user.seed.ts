import argon2 from "argon2";
import type { DataSource } from "typeorm";
import { User } from "./user.entity.js";
import { isRole, type Role } from "../../shared/constants/roles.js";

export async function ensureInitialAdmin(ds: DataSource) {
  const repo = ds.getRepository(User);

  const usernameEnv = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const nameEnv = process.env.ADMIN_NAME?.trim();
  const roleEnv = process.env.ADMIN_ROLE?.trim()?.toUpperCase();

  if (!usernameEnv || !nameEnv || !roleEnv || !isRole(roleEnv)) {
    console.warn(
      "[seed] No se creó el admin inicial: faltan ADMIN_USERNAME, ADMIN_NAME o ADMIN_ROLE."
    );
    return null;
  }

  const role = roleEnv as Role;
  const username = usernameEnv;

  const existing = await repo.findOne({ where: { username } });
  if (existing) return existing;

  const passwordHashEnv = process.env.ADMIN_PASSWORD_HASH?.trim();
  const plainPasswordEnv = process.env.ADMIN_PASSWORD?.trim();

  let passwordHash: string | null = null;
  if (passwordHashEnv) {
    passwordHash = passwordHashEnv;
  } else if (plainPasswordEnv) {
    passwordHash = await argon2.hash(plainPasswordEnv, { type: argon2.argon2id });
  }

  if (!passwordHash) {
    console.warn(
      "[seed] No se creó el admin inicial: falta ADMIN_PASSWORD o ADMIN_PASSWORD_HASH."
    );
    return null;
  }

  const admin = repo.create({
    username,
    name: nameEnv,
    passwordHash,
    role,
    active: true,
  });

  return repo.save(admin);
}
