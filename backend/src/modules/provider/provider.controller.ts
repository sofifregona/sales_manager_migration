import type { NextFunction, Request, Response } from "express";
import {
  createProvider,
  deactivateProvider,
  getAllProviders,
  getProviderById,
  reactivateProvider,
  updateProvider,
} from "./provider.service.js";
import { makeProviderRepository } from "./provider.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

const providerRepo = makeProviderRepository(AppDataSource);
const parseId = (req: Request) => Number.parseInt(req.params.id, 10);

export const createProviderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const provider = await createProvider(providerRepo, {
      actorId: sessionUser.id,
      ...req.body,
    });
    res.status(201).json(provider);
  } catch (error) {
    next(error);
  }
};

export const updateProviderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const updated = await updateProvider(providerRepo, {
      actorId: sessionUser.id,
      id,
      ...req.body,
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateProviderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const strategy = req.body?.strategy as
      | "clear-products-provider"
      | "cascade-deactivate-products"
      | "cancel"
      | undefined;
    const provider = await deactivateProvider(
      providerRepo,
      {
        actorId: sessionUser.id,
        id,
        strategy,
      }
    );
    res.status(200).json(provider);
  } catch (error) {
    next(error);
  }
};

export const reactivateProviderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const provider = await reactivateProvider(providerRepo, {
      actorId: sessionUser.id,
      id,
    });
    res.status(200).json(provider);
  } catch (error) {
    next(error);
  }
};

export const getAllProvidersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const includeInactive = req.query.includeInactive as string | undefined;
  try {
    const providers = await getAllProviders(
      providerRepo,
      includeInactive === "1" || includeInactive === "true"
    );
    res.status(200).json(providers);
  } catch (error) {
    next(error);
  }
};

export const getProviderByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseId(req);
  try {
    const provider = await getProviderById(providerRepo, id);
    res.status(200).json(provider);
  } catch (error) {
    next(error);
  }
};
