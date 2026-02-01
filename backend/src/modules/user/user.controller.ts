import type { NextFunction, Request, Response } from "express";
import {
  createUser,
  deactivateUser,
  getAllUsers,
  getUserById,
  reactivateUser,
  resetUserPassword,
  updateUser,
} from "./user.service.js";
import { makeUserRepository } from "./user.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

const userRepo = makeUserRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req);
  try {
    const user = await createUser(userRepo, req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const updated = await updateUser(userRepo, { id, ...req.body });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const user = await deactivateUser(userRepo, id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const reactivateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const user = await reactivateUser(userRepo, id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAllUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const includeInactive = req.query.includeInactive as string | undefined;
  try {
    const users = await getAllUsers(
      userRepo,
      includeInactive === "1" || includeInactive === "true"
    );
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const user = await getUserById(userRepo, id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const resetUserPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseId(req);
    const { newPassword } = req.body ?? {};
    if (!newPassword) {
      return res.status(400).json({ message: "newPassword es requerido" });
    }
    await resetUserPassword(userRepo, {
      id,
      newPassword: String(newPassword),
    });
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};
