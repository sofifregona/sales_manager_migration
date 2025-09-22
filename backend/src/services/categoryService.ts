import { categoryRepo } from "../repositories/categoryRepo.js";
import { Category } from "../entities/Category.js";
import { AppError } from "../errors/AppError.js";
import { validateNumberID } from "../utils/validations/validationHelpers.js";
import { normalizeText } from "../utils/helpers/normalizeText.js";

// SERVICE FOR CREATE A BARTABLE
export const createCategory = async (data: { name: string }) => {
  const { name } = data;

  const normalizedName = normalizeText(name);
  // Validations for repeting brands
  const duplicate = await categoryRepo.findOneBy({ normalizedName });
  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError("Ya existe una categoría con este nombre", 409);
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    duplicate.active = true;
    return await categoryRepo.save(duplicate);
  }

  // If it doesn't exist, create a new one
  const newCategory = new Category();
  newCategory.name = name;
  newCategory.normalizedName = normalizedName;
  newCategory.active = true;

  return await categoryRepo.save(newCategory);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateCategory = async (updatedData: {
  id: number;
  name?: string;
  active?: boolean;
}) => {
  const { id, name, active } = updatedData;
  validateNumberID(id);
  const existing = await categoryRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("Categoría no encontrada", 404);

  const data: Partial<Category> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    // Validations for repeting brands
    const duplicate = await categoryRepo.findOneBy({ normalizedName });

    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError("Ya existe una categoría con este nombre", 409);
    }
    if (duplicate && !duplicate.active) {
      data.active = true;
      await categoryRepo.update(duplicate.id, data);
      await categoryRepo.update(existing.id, { active: false });
      return await categoryRepo.findOneBy({ id: duplicate.id });
    } else {
      data.name = name;
      data.normalizedName = normalizedName;
    }
  }

  if (active !== undefined) {
    data.active = active;
  }
  await categoryRepo.update(id, data);
  return await categoryRepo.findOneBy({ id });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllCategories = async () => {
  return await categoryRepo.find({
    where: {
      active: true,
    },
  });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getCategoryById = async (id: number) => {
  validateNumberID(id);
  const existing = await categoryRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("Categoría no encontrada", 404);
  return existing;
};
