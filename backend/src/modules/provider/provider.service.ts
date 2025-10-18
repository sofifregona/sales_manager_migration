import { providerRepo } from "./provider.repo.js";
import { Provider } from "./provider.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import {
  validateCUI,
  validateEmailFormat,
  validateTelephone,
} from "@back/src/shared/utils/validations/validationPerson.js";

import { validateNumberID } from "@back/src/shared/utils/validations/validationHelpers.js";

// SERVICE FOR CREATE A BARTABLE
export const createProvider = async (data: {
  name: string;
  cuit: number | null;
  telephone: number | null;
  email: string | null;
  address: string | null;
}) => {
  const { name, cuit, telephone, email, address } = data;

  const normalizedName = normalizeText(name);
  const duplicate = await providerRepo.findOneBy({ normalizedName });

  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe un proveedor activo con este nombre.",
      409,
      "PROVIDER_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  if (cuit !== null) {
    validateCUI(cuit, 11, "CUIT");
    const duplicatedByCuit = await providerRepo.findOneBy({ cuit });
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

  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado un proveedor inactivo con este nombre.",
      409,
      "PROVIDER_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  const newProvider = Object.assign(new Provider(), {
    name,
    normalizedName,
    cuit: cuit ?? null,
    telephone: telephone ?? null,
    email: email ?? null, // ya validado y trimmeado antes
    address: address ?? null, // también procesado antes
    active: true,
  });

  return await providerRepo.save(newProvider);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateProvider = async (updatedData: {
  id: number;
  name?: string;
  cuit?: number | null;
  telephone?: number | null;
  email?: string | null;
  address?: string | null;
  active?: boolean;
}) => {
  const { id, name, cuit, telephone, email, address, active } = updatedData;
  validateNumberID(id, "Proveedor");
  const existing = await providerRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Proveedor no encontrado", 404);

  const data: Partial<Provider> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    const duplicate = await providerRepo.findOneBy({ normalizedName });
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe un proveedor activo con este nombre.",
        409,
        "PROVIDER_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap automático: informamos conflicto reactivable
      throw new AppError(
        "(Error) Ya existe un proveedor inactivo con este nombre.",
        409,
        "PROVIDER_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      data.name = name;
      data.normalizedName = normalizedName;
    }
  }

  if (cuit !== undefined) {
    if (cuit !== null) {
      validateCUI(cuit, 11, "CUIT");
      const duplicate = await providerRepo.findOneBy({ cuit });
      if (duplicate && duplicate.id !== id && duplicate.active) {
        throw new AppError(
          "(Error) Ya existe un proveedor activo con este CUIT.",
          409,
          "PROVIDER_EXISTS_ACTIVE",
          { existingId: duplicate.id }
        );
      }
    }
    data.cuit = cuit;
  }

  if (telephone !== undefined) {
    if (telephone !== null) {
      validateTelephone(telephone, "Teléfono");
    }
    data.telephone = telephone;
  }

  if (email !== undefined) {
    if (email !== null) {
      validateEmailFormat(email);
    }
    data.email = email;
  }

  if (address !== undefined) {
    data.address = address;
  }

  await providerRepo.update(id, data);
  return await providerRepo.findOneBy({ id });
};

export const reactivateProvider = async (id: number) => {
  validateNumberID(id, "Proveedor");
  const existing = await providerRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Proveedor no encontrado.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El proveedor ya está activo.",
      409,
      "PROVIDER_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await providerRepo.update(id, { active: true });
  return await providerRepo.findOneBy({ id });
};

export const softDeleteProvider = async (id: number) => {
  validateNumberID(id, "Proveedor");

  const existing = await providerRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Proveedor no encontrado.", 404);
  await providerRepo.update(id, { active: false });
};

export const getAllProviders = async (
  includeInactive: boolean,
  sort?: { field?: "name" | "active"; direction?: "ASC" | "DESC" }
) => {
  const where = includeInactive ? {} : { active: true };
  const order: Record<string, "ASC" | "DESC"> = {};
  const field =
    sort?.field === "name" ? "normalizedName" : sort?.field ?? "normalizedName";
  const direction = sort?.direction ?? "ASC";
  order[field] = direction;
  return await providerRepo.find({ where, order });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getProviderById = async (id: number) => {
  validateNumberID(id, "Proveedor");
  const existing = await providerRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Proveedor no encontrada", 404);
  return existing;
};
