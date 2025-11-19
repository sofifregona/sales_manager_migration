import type { ProviderRepository } from "./provider.repo.js";
import { Provider } from "./provider.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import {
  validateCUI,
  validateEmailFormat,
  validateTelephone,
} from "@back/src/shared/utils/validations/validationPerson.js";
import {
  validateNumberID,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";

import { createAuditLog } from "../auditLog/audit-log.service.js";
import { makeAuditLogRepository } from "../auditLog/audit-log.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";

const auditLogRepo = makeAuditLogRepository(AppDataSource);
const PROVIDER_ENTITY = "Provider";

export const createProvider = async (
  repo: ProviderRepository,
  data: {
    actorId: number;
    name: string;
    cuit: number | null;
    telephone: number | null;
    email: string | null;
    address: string | null;
  }
) => {
  const { actorId, name, cuit, telephone, email, address } = data;
  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 8, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);
  const duplicate = await repo.findByNormalizedName(normalizedName);

  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe un proveedor activo con este nombre.",
      409,
      "PROVIDER_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado un proveedor inactivo con este nombre.",
      409,
      "PROVIDER_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  if (cuit !== null) {
    validateCUI(cuit, 11, "CUIT");
    const duplicatedByCuit = await repo.findByCuit(cuit);
    if (duplicatedByCuit?.active) {
      throw new AppError(
        "(Error) Ya existe un proveedor activo con este CUIT.",
        409,
        "PROVIDER_EXISTS_ACTIVE",
        { existingId: duplicatedByCuit.id }
      );
    }
  }

  if (telephone !== null) {
    validateTelephone(telephone, "Teléfono");
  }

  if (email !== null) {
    validateEmailFormat(email);
  }

  const entity = repo.create({
    name: cleanedName,
    normalizedName,
    cuit,
    telephone,
    email: email != null ? email.replace(/\s+/g, " ").trim() : null,
    address: address != null ? address.replace(/\s+/g, " ").trim() : null,
    active: true,
  });

  const saved = await repo.save(entity as Provider);
  await createAuditLog(auditLogRepo, {
    userId: actorId,
    entity: PROVIDER_ENTITY,
    entityId: saved.id,
    action: "PROVIDER_CREATE",
    payload: {
      new: {
        name: saved.name,
        cuit: saved.cuit,
        telephone: saved.telephone,
        email: saved.email,
        address: saved.address,
      },
    },
  });
  return saved;
};

type ProviderChanges = Record<
  string,
  { previous: string | number | null; current: string | number | null }
>;

export const updateProvider = async (
  repo: ProviderRepository,
  updatedData: {
    actorId: number;
    id: number;
    name?: string;
    cuit?: number | null;
    telephone?: number | null;
    email?: string | null;
    address?: string | null;
  }
): Promise<Provider | null> => {
  const { actorId, id, name, cuit, telephone, email, address } = updatedData;
  validateNumberID(id, "Proveedor");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Proveedor no encontrado", 404);

  const patch: Partial<Provider> = {};
  const changes: ProviderChanges = {};

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 8, 80, "Nombre");
    const normalizedName = normalizeText(cleanedName);
    const duplicate = await repo.findByNormalizedName(normalizedName);
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe un proveedor activo con este nombre.",
        409,
        "PROVIDER_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      throw new AppError(
        "(Error) Ya existe un proveedor inactivo con este nombre.",
        409,
        "PROVIDER_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (cleanedName !== existing.name) {
      patch.name = cleanedName;
      patch.normalizedName = normalizedName;
      changes.name = { previous: existing.name, current: cleanedName };
    }
  }

  if (cuit !== undefined) {
    if (cuit !== null) {
      validateCUI(cuit, 11, "CUIT");
      const duplicate = await repo.findByCuit(cuit);
      if (duplicate && duplicate.id !== id && duplicate.active) {
        throw new AppError(
          "(Error) Ya existe un proveedor activo con este CUIT.",
          409,
          "PROVIDER_EXISTS_ACTIVE",
          { existingId: duplicate.id }
        );
      }
    }
    if (cuit !== existing.cuit) {
      patch.cuit = cuit;
      changes.cuit = {
        previous: existing.cuit,
        current: cuit ?? null,
      };
    }
  }

  if (telephone !== undefined) {
    if (telephone !== null) {
      validateTelephone(telephone, "Teléfono");
    }
    if (telephone !== existing.telephone) {
      patch.telephone = telephone;
      changes.telephone = {
        previous: existing.telephone,
        current: telephone ?? null,
      };
    }
  }

  if (email !== undefined) {
    if (email !== null) {
      validateEmailFormat(email);
    }
    const normalizedEmail =
      email != null ? email.replace(/\s+/g, " ").trim() : null;
    if (normalizedEmail !== existing.email) {
      patch.email = normalizedEmail;
      changes.email = {
        previous: existing.email,
        current: normalizedEmail,
      };
    }
  }

  if (address !== undefined) {
    const normalizedAddress =
      address != null ? address.replace(/\s+/g, " ").trim() : null;
    if (normalizedAddress !== existing.address) {
      patch.address = normalizedAddress;
      changes.address = {
        previous: existing.address,
        current: normalizedAddress,
      };
    }
  }

  if (Object.keys(patch).length) {
    await repo.updateFields(id, patch);
  }

  const provider = await repo.findById(id);
  if (provider && Object.keys(changes).length) {
    await createAuditLog(auditLogRepo, {
      userId: actorId,
      entity: PROVIDER_ENTITY,
      entityId: provider.id,
      action: "PROVIDER_UPDATE",
      payload: { changes },
    });
  }
  return provider;
};

type DeactivateProviderStrategy =
  | "clear-products-provider"
  | "cascade-deactivate-products"
  | "cancel";

export const reactivateProvider = async (
  repo: ProviderRepository,
  data: { actorId: number; id: number }
) => {
  const { actorId, id } = data;
  validateNumberID(id, "Proveedor");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Proveedor no encontrado.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El proveedor ya está activo.",
      409,
      "PROVIDER_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await repo.reactivate(id);
  const provider = await repo.findById(id);
  if (provider) {
    await createAuditLog(auditLogRepo, {
      userId: actorId,
      entity: PROVIDER_ENTITY,
      entityId: provider.id,
      action: "PROVIDER_REACTIVATE",
    });
  }
  return provider;
};

export const deactivateProvider = async (
  repo: ProviderRepository,
  data: {
    actorId: number;
    id: number;
    strategy?: DeactivateProviderStrategy;
  }
) => {
  const { actorId, id, strategy } = data;
  validateNumberID(id, "Proveedor");

  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Proveedor no encontrado.", 404);

  const count = await repo.countActiveProducts(id);
  if (count > 0 && !strategy) {
    throw new AppError(
      `(Advertencia) El proveedor que desea eliminar está asociado a ${
        count === 1 ? "un producto" : `${count} productos`
      }.`,
      409,
      "PROVIDER_IN_USE",
      {
        count,
        allowedStrategies: [
          "clear-products-provider",
          "cascade-deactivate-products",
          "cancel",
        ],
      }
    );
  }

  if (count === 0 || strategy === "cancel") {
    if (strategy === "cancel") return existing;
    await repo.deactivate(id);
    const provider = await repo.findById(id);
    if (provider) {
      await createAuditLog(auditLogRepo, {
        userId: actorId,
        entity: PROVIDER_ENTITY,
        entityId: provider.id,
        action: "PROVIDER_DEACTIVATE",
        payload: { strategy: strategy ?? "default" },
      });
    }
    return provider;
  }

  if (strategy === "clear-products-provider") {
    await repo.clearProviderFromActiveProducts(id);
  }
  if (strategy === "cascade-deactivate-products") {
    await repo.deactivateActiveProducts(id);
  }
  await repo.deactivate(id);
  const provider = await repo.findById(id);
  if (provider) {
    await createAuditLog(auditLogRepo, {
      userId: actorId,
      entity: PROVIDER_ENTITY,
      entityId: provider.id,
      action: "PROVIDER_DEACTIVATE",
      payload: { strategy: strategy ?? "default" },
    });
  }
  return provider;
};

export const getAllProviders = async (
  repo: ProviderRepository,
  includeInactive: boolean
) => {
  return repo.getAll(includeInactive);
};

export const getProviderById = async (
  repo: ProviderRepository,
  id: number
) => {
  validateNumberID(id, "Proveedor");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Proveedor no encontrada", 404);
  return existing;
};
