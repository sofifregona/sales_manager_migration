import { employeeRepo } from "./employee.repo.js";
import { Employee } from "./employee.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";

import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import {
  validateCUI,
  validateEmailFormat,
  validateTelephone,
} from "@back/src/shared/utils/validations/validationPerson.js";

import { validateNumberID } from "@back/src/shared/utils/validations/validationHelpers.js";

// SERVICE FOR CREATE A BARTABLE
export const createEmployee = async (data: {
  name: string;
  dni: number | null;
  telephone: number | null;
  email: string | null;
  address: string | null;
}) => {
  const { name, dni, telephone, email, address } = data;

  const normalizedName = normalizeText(name);
  const duplicate = await employeeRepo.findOneBy({ normalizedName });

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
    const existingByDni = await employeeRepo.findOneBy({ dni });
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
    return await employeeRepo.save(duplicate);
  }

  const newEmployee = Object.assign(new Employee(), {
    name,
    normalizedName,
    dni: dni ?? null,
    telephone: telephone ?? null,
    email: email ?? null, // ya validado y trimmeado antes
    address: address ?? null, // también procesado antes
    active: true,
  });

  return await employeeRepo.save(newEmployee);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateEmployee = async (updatedData: {
  id: number;
  name?: string;
  dni?: number | null;
  telephone?: number | null;
  email?: string | null;
  address?: string | null;
  active?: boolean;
}) => {
  const { id, name, dni, telephone, email, address, active } = updatedData;
  validateNumberID(id, "Empleado");
  const existing = await employeeRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Empleado no encontrado", 404);

  const data: Partial<Employee> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    const duplicate = await employeeRepo.findOneBy({ normalizedName });
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
      data.name = name;
      data.normalizedName = normalizedName;
    }
  }

  if (dni !== undefined) {
    if (dni !== null) {
      validateCUI(dni, 8, "DNI");
      const duplicate = await employeeRepo.findOneBy({ dni });
      if (duplicate && duplicate.id !== id && duplicate.active) {
        throw new AppError(
          "(Error) Ya existe un empleado activo con este DNI.",
          409,
          "EMPLOYEE_EXISTS_ACTIVE",
          { existingId: duplicate.id }
        );
      }
    }
    data.dni = dni;
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

  await employeeRepo.update(id, data);
  return await employeeRepo.findOneBy({ id });
};

export const reactivateEmployee = async (id: number) => {
  validateNumberID(id, "Empleado");
  const existing = await employeeRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Empleado no encontrada.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El empleado ya está activa.",
      409,
      "EMPLOYEE_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await employeeRepo.update(id, { active: true });
  return await employeeRepo.findOneBy({ id });
};

export const softDeleteEmployee = async (id: number) => {
  validateNumberID(id, "Empleado");

  const existing = await employeeRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Empleado no encontrado.", 404);
  await employeeRepo.update(id, { active: false });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllEmployees = async (
  includeInactive: boolean,
  sort?: { field?: "name" | "active"; direction?: "ASC" | "DESC" }
) => {
  const where = includeInactive ? {} : { active: true };
  const order: Record<string, "ASC" | "DESC"> = {};
  const field =
    sort?.field === "name" ? "normalizedName" : sort?.field ?? "normalizedName";
  const direction = sort?.direction ?? "ASC";
  order[field] = direction;
  return await employeeRepo.find({ where, order });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getEmployeeById = async (id: number) => {
  validateNumberID(id, "Empleado");
  const existing = await employeeRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Empleado no encontrada", 404);
  return existing;
};
