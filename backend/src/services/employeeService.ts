import { employeeRepo } from "../repositories/employeeRepo.js";
import { Employee } from "../entities/Employee.js";
import { AppError } from "../errors/AppError.js";

import { normalizeText } from "../utils/helpers/normalizeText.js";
import {
  validateCUI,
  validateEmailFormat,
  validateTelephone,
} from "../utils/validations/validationPerson.js";

import { validateNumberID } from "../utils/validations/validationHelpers.js";

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
    throw new AppError("Ya existe un empleado con este nombre", 409);
  }

  if (dni !== null) {
    validateCUI(dni, 8);
    const existingByDni = await employeeRepo.findOneBy({ dni });
    if (existingByDni?.active) {
      throw new AppError("Ya existe un empleado con ese DNI.", 409);
    }
  }

  if (telephone !== null) {
    validateTelephone(telephone);
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
  validateNumberID(id);
  const existing = await employeeRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("Empleado no encontrado", 404);

  const data: Partial<Employee> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    const duplicate = await employeeRepo.findOneBy({ normalizedName });
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError("Ya existe un empleado con este nombre", 409);
    }
    if (duplicate && !duplicate.active) {
      data.active = true;
      await employeeRepo.update(duplicate.id, data);
      data.name = existing.name;
      data.normalizedName = existing.normalizedName;
      data.active = false;
    } else {
      data.name = name;
      data.normalizedName = normalizedName;
    }
  }

  if (dni !== undefined) {
    if (dni !== null) {
      validateCUI(dni, 8);
      const duplicate = await employeeRepo.findOneBy({ dni });
      if (duplicate && duplicate.id !== id && duplicate.active) {
        throw new AppError("Ya existe un empleado con este DNI.", 409);
      }
    }
    data.dni = dni;
  }

  if (telephone !== undefined) {
    if (telephone !== null) {
      validateTelephone(telephone);
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

  if (active !== undefined) {
    data.active = active;
  }
  await employeeRepo.update(id, data);
  return await employeeRepo.findOneBy({ id });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllEmployees = async () => {
  return await employeeRepo.find({
    where: {
      active: true,
    },
  });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getEmployeeById = async (id: number) => {
  validateNumberID(id);
  const existing = await employeeRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("Empleado no encontrada", 404);
  return existing;
};
