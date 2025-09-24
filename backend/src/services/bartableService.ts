import { bartableRepo } from "../repositories/bartableRepo.js";
import { Bartable } from "../entities/Bartable.js";
import { AppError } from "../errors/AppError.js";
import {
  validateIsInteger,
  validateIsPositive,
  validateNumber,
  validateNumberID,
} from "../utils/validations/validationHelpers.js";

// SERVICE FOR CREATE A BARTABLE
export const createBartable = async (data: { number: number }) => {
  const { number } = data;

  validateNumber(number);
  validateIsInteger(number);
  validateIsPositive(number);

  // Validations for repeting bartables
  const duplicate = await bartableRepo.findOneBy({ number });

  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError("Ya existe una mesa con este número", 409);
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    duplicate.active = true;
    return await bartableRepo.save(duplicate);
  }

  // If it doesn't exist, create a new one
  const newBartable = new Bartable();
  newBartable.number = number;
  newBartable.active = true;

  return await bartableRepo.save(newBartable);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateBartable = async (updatedData: {
  id: number;
  number?: number;
  active?: boolean;
}) => {
  const { id, number, active } = updatedData;
  validateNumberID(id);
  const existing = await bartableRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("Mesa no encontrada", 404);

  const data: Partial<Bartable> = {};

  if (number !== undefined) {
    validateNumber(number);
    validateIsInteger(number);
    validateIsPositive(number);

    const duplicate = await bartableRepo.findOneBy({ number });
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError("Ya existe una mesa con este número", 409);
    }

    if (duplicate && !duplicate.active) {
      data.active = true;
      await bartableRepo.update(duplicate.id, data);
      await bartableRepo.update(existing.id, { active: false });
      return await bartableRepo.findOneBy({ id: duplicate.id });
    } else {
      data.number = number;
    }
  }

  if (active !== undefined) {
    data.active = active;
  }
  await bartableRepo.update(id, data);
  return await bartableRepo.findOneBy({ id });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllBartables = async () => {
  return await bartableRepo.find({
    where: {
      active: true,
    },
  });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getBartableById = async (id: number) => {
  validateNumberID(id);
  const existing = await bartableRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("Mesa no encontrada", 404);
  return existing;
};
