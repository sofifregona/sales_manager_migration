import argon2 from "argon2";
import { User } from "./user.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import type { UserRepository } from "./user.repo.js";
import {
  validateNumberID,
  validateRangeLength,
  validateUsernameFormat,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import { isRole, type Role } from "@back/src/shared/constants/roles.js";

export const createUser = async (
  repo: UserRepository,
  data: {
    username: string;
    name: string;
    password: string;
    role: string;
  }
) => {
  const { username, name, password, role } = data;
  const normalizedUsername = username.trim().toLowerCase();
  validateUsernameFormat(normalizedUsername);
  validateRangeLength(normalizedUsername, 5, 32, "Nombre de usuario");

  const duplicate = await repo.findByUsername(normalizedUsername);
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe un usuario activo con este nombre.",
      409,
      "USERNAME_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado un usuario inactivo con este nombre.",
      409,
      "USERNAME_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 5, 80, "Nombre");
  validateRangeLength(password, 8, 80, "Contraseña");

  const roleNorm = String(role).toUpperCase();
  if (!isRole(roleNorm)) {
    throw new AppError(
      "(Error) Rol inválido. Valores permitidos: ADMIN, MANAGER, CASHIER.",
      422,
      "VALIDATION_ROLE"
    );
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const entity = repo.create({
    username: normalizedUsername,
    name: cleanedName,
    passwordHash,
    role: roleNorm as Role,
  });

  return await repo.save(entity as User);
};

export const updateUser = async (
  repo: UserRepository,
  data: {
    id: number;
    username?: string;
    name?: string;
    role?: string;
  }
) => {
  const { id, username, name, role } = data;
  validateNumberID(id, "Usuario");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Usuario no encontrado", 404);

  const patch: Partial<User> = {};

  if (username !== undefined) {
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername !== existing.username) {
      validateUsernameFormat(normalizedUsername);
      validateRangeLength(normalizedUsername, 5, 32, "Nombre de usuario");

      const duplicate = await repo.findByUsername(normalizedUsername);
      if (duplicate?.active) {
        throw new AppError(
          "(Error) Ya existe un usuario activo con este nombre.",
          409,
          "USERNAME_EXISTS_ACTIVE",
          { existingId: duplicate.id }
        );
      }
      if (duplicate && !duplicate.active) {
        throw new AppError(
          "(Error) Se ha detectado un usuario inactivo con este nombre.",
          409,
          "USERNAME_EXISTS_INACTIVE",
          { existingId: duplicate.id }
        );
      }
      patch.username = normalizedUsername;
    }
  }

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 5, 80, "Nombre");
    if (cleanedName !== existing.name) {
      patch.name = cleanedName;
    }
  }

  if (role !== undefined) {
    const roleNorm = String(role).toUpperCase();
    if (!isRole(roleNorm)) {
      throw new AppError(
        "(Error) Rol inválido. Valores permitidos: ADMIN, MANAGER, CASHIER.",
        422,
        "VALIDATION_ROLE"
      );
    }
    if (roleNorm !== existing.role) {
      patch.role = roleNorm as Role;
    }
  }

  if (Object.keys(patch).length) {
    await repo.updateFields(id, patch);
  }

  return await repo.findById(id);
};

export const deactivateUser = async (repo: UserRepository, id: number) => {
  validateNumberID(id, "Usuario");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Usuario no encontrado.", 404);
  await repo.deactivate(id);
  return await repo.findById(id);
};

export const reactivateUser = async (repo: UserRepository, id: number) => {
  validateNumberID(id, "Usuario");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Usuario no encontrado.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El usuario ya está activo.",
      409,
      "USER_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await repo.reactivate(id);
  return await repo.findById(id);
};

export const getAllUsers = async (
  repo: UserRepository,
  includeInactive: boolean
) => {
  return repo.getAll(includeInactive);
};

export const getUserById = async (repo: UserRepository, id: number) => {
  validateNumberID(id, "Usuario");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Usuario no encontrado", 404);
  return existing;
};

export const resetUserPassword = async (
  repo: UserRepository,
  data: { id: number; newPassword: string }
) => {
  const { id, newPassword } = data;
  validateNumberID(id, "Usuario");
  validateRangeLength(newPassword, 8, 80, "Contraseña");

  const user = await repo.findById(id);
  if (!user) throw new AppError("(Error) Usuario no encontrado", 404);

  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
  });
  await repo.resetPassword(id, { passwordHash });
};
