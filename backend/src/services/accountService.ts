import { accountRepo } from "../repositories/accountRepo.js";
import { Account } from "../entities/Account.js";
import { AppError } from "../errors/AppError.js";
import { normalizeText } from "../utils/helpers/normalizeText.js";
import { validateNumberID } from "../utils/validations/validationHelpers.js";

// SERVICE FOR CREATE A BARTABLE
export const createAccount = async (data: {
  name: string;
  description: string | null;
}) => {
  const { name, description } = data;

  const normalizedName = normalizeText(name);
  // Validations for repeting brands
  const duplicate = await accountRepo.findOneBy({ normalizedName });

  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError("(Error) Ya existe una cuenta con este nombre.", 409);
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    duplicate.active = true;
    return await accountRepo.save(duplicate);
  }

  // If it doesn't exist, create a new one
  const newAccount = new Account();
  newAccount.name = name;
  newAccount.normalizedName = normalizedName;
  newAccount.description = description;
  newAccount.active = true;

  return await accountRepo.save(newAccount);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateAccount = async (updatedData: {
  id: number;
  name?: string;
  description?: string;
  active?: boolean;
}) => {
  const { id, name, description, active } = updatedData;
  validateNumberID(id, "Cuenta");

  const existing = await accountRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);

  const data: Partial<Account> = {};

  if (name !== undefined) {
    const duplicate = await accountRepo.findOneBy({ name });
    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError("(Error) Ya existe una cuenta con este nombre.", 409);
    }

    if (duplicate && !duplicate.active) {
      data.active = true;
      await accountRepo.update(duplicate.id, data);
      await accountRepo.update(existing.id, { active: false });
      return await accountRepo.findOneBy({ id: duplicate.id });
    } else {
      data.name = name;
      data.normalizedName = normalizeText(name);
    }
  }

  if (description !== undefined) {
    data.description = description;
  }

  if (active !== undefined) {
    data.active = active;
  }
  await accountRepo.update(id, data);
  return await accountRepo.findOneBy({ id });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllAccounts = async () => {
  return await accountRepo.find({
    where: {
      active: true,
    },
  });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getAccountById = async (id: number) => {
  validateNumberID(id, "Cuenta");
  const existing = await accountRepo.findOneBy({ id, active: true });
  if (!existing) throw new AppError("(Error) Cuenta no encontrada.", 404);
  return existing;
};
