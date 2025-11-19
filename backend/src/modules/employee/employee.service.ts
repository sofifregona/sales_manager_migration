import { type EmployeeRepository } from "./employee.repo.js";
import { Employee } from "./employee.entity.js";
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

// SERVICE FOR CREATE A BARTABLE
export const createEmployee = async (
  repo: EmployeeRepository,
  data: {
    name: string;
    dni: number | null;
    telephone: number | null;
    email: string | null;
    address: string | null;
  }
) => {
  const { name, dni, telephone, email, address } = data;
  const cleanedName = name.replace(/\s+/g, " ").trim();
  validateRangeLength(cleanedName, 8, 80, "Nombre");
  const normalizedName = normalizeText(cleanedName);
  const duplicate = await repo.findByNormalizedName(normalizedName);

  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe un empleado activo con este nombre.",
      409,
      "EMPLOYEE_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  if (dni !== null) {
    validateCUI(dni, 8, "DNI");
    const existingByDni = await repo.findByDni(dni);
    if (existingByDni?.active) {
      throw new AppError(
        "(Error) Ya existe un empleado activo con este DNI.",
        409,
        "EMPLOYEE_EXISTS_ACTIVE",
        { existingId: existingByDni.id }
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
    duplicate.active = true;
    return await repo.save(duplicate);
  }

  const entity = repo.create({
    name,
    normalizedName,
    dni,
    telephone,
    email,
    address,
    active: true,
  });
  return await repo.save(entity);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateEmployee = async (
  repo: EmployeeRepository,
  updatedData: {
    id: number;
    name?: string;
    dni?: number | null;
    telephone?: number | null;
    email?: string | null;
    address?: string | null;
  }
) => {
  const { id, name, dni, telephone, email, address } = updatedData;
  validateNumberID(id, "Empleado");
  const existing = await repo.findActiveById(id);
  if (!existing) throw new AppError("(Error) Empleado no encontrado", 404);

  const patch: Partial<Employee> = {};

  if (name !== undefined) {
    const cleanedName = name.replace(/\s+/g, " ").trim();
    validateRangeLength(cleanedName, 8, 80, "Nombre");
    const normalizedName = normalizeText(cleanedName);
    const duplicate = await repo.findByNormalizedName(normalizedName);
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe un empleado activo con este nombre.",
        409,
        "EMPLOYEE_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      // No swap automático: informamos conflicto reactivable
      throw new AppError(
        "(Error) Se ha detectado un empleado inactivo con este nombre.",
        409,
        "EMPLOYEE_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      patch.name = cleanedName;
      patch.normalizedName = normalizedName;
    }
  }

  if (dni !== undefined) {
    if (dni !== null) {
      validateCUI(dni, 8, "DNI");
      const duplicate = await repo.findByDni(dni);
      if (duplicate && duplicate.id !== id && duplicate.active) {
        throw new AppError(
          "(Error) Ya existe un empleado activo con este DNI.",
          409,
          "EMPLOYEE_EXISTS_ACTIVE",
          { existingId: duplicate.id }
        );
      }
    }
    patch.dni = dni;
  }

  if (telephone !== undefined) {
    if (telephone !== null) {
      validateTelephone(telephone, "Teléfono");
    }
    patch.telephone = telephone;
  }

  if (email !== undefined) {
    if (email !== null) {
      validateEmailFormat(email);
    }
    patch.email = email != null ? email.replace(/\s+/g, " ").trim() : null;
  }

  if (address !== undefined) {
    patch.address =
      address != null ? address.replace(/\s+/g, " ").trim() : null;
  }

  if (Object.keys(patch).length) {
    await repo.updateFields(id, patch as any);
  }
  return await repo.findById(id);
};

export const deactivateEmployee = async (
  repo: EmployeeRepository,
  id: number
) => {
  validateNumberID(id, "Empleado");

  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Empleado no encontrado.", 404);
  const openSale = await repo.findOpenSales(id);
  if (openSale) {
    throw new AppError(
      "(Error) No se puede eliminar un empleado que tenga una venta activa.",
      404
    );
  }
  await repo.deactivate(id);
};

export const reactivateEmployee = async (
  repo: EmployeeRepository,
  id: number
) => {
  validateNumberID(id, "Empleado");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Empleado no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El empleado ya está activa.",
      409,
      "EMPLOYEE_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await repo.reactivate(id);
  return await repo.findById(id);
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllEmployees = (
  repo: EmployeeRepository,
  includeInactive: boolean = false
) => {
  return repo.getAll(includeInactive);
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getEmployeeById = async (repo: EmployeeRepository, id: number) => {
  validateNumberID(id, "Empleado");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Empleado no encontrado", 404);
  return existing;
};
