import { paymentRepo } from "./payment.repo.js";
import { Payment } from "./payment.entity.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import { validateNumberID } from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import { getAccountById } from "../account/account.service.js";

// SERVICE FOR CREATE A BARTABLE
export const createPayment = async (data: {
  name: string;
  idAccount: number;
}) => {
  const { name, idAccount } = data;

  const normalizedName = normalizeText(name);
  // Validations for repeting brands
  const duplicate = await paymentRepo.findOneBy({ normalizedName });
  // If it exists and is active, then throw an error
  if (duplicate?.active) {
    throw new AppError(
      "(Error) Ya existe un método de pago activo con este nombre.",
      409,
      "PAYMENT_EXISTS_ACTIVE",
      { existingId: duplicate.id }
    );
  }

  // If it exists but is not active, then activate the existing one
  if (duplicate && !duplicate.active) {
    throw new AppError(
      "(Error) Se ha detectado un método de pago inactivo con este nombre.",
      409,
      "PAYMENT_EXISTS_INACTIVE",
      { existingId: duplicate.id }
    );
  }

  validateNumberID(idAccount, "Cuenta");
  const account = await getAccountById(idAccount);

  // If it doesn't exist, create a new one
  const newPayment = new Payment();
  newPayment.name = name;
  newPayment.normalizedName = normalizedName;
  newPayment.account = account;
  newPayment.active = true;

  return await paymentRepo.save(newPayment);
};

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updatePayment = async (updatedData: {
  id: number;
  name?: string;
  idAccount?: number;
  active?: boolean;
}) => {
  const { id, name, idAccount, active } = updatedData;
  validateNumberID(id, "Método de pago");
  const existing = await paymentRepo.findOneBy({ id, active: true });
  if (!existing)
    throw new AppError("(Error) Método de pago no encontrado.", 404);

  const data: Partial<Payment> = {};

  if (name !== undefined) {
    const normalizedName = normalizeText(name);
    // Validations for repeting brands
    const duplicate = await paymentRepo.findOneBy({ normalizedName });

    if (duplicate && duplicate.id !== id && duplicate.active) {
      throw new AppError(
        "(Error) Ya existe un método de pago activo con este nombre.",
        409,
        "PAYMENT_EXISTS_ACTIVE",
        { existingId: duplicate.id }
      );
    }
    if (duplicate && duplicate.id !== id && !duplicate.active) {
      throw new AppError(
        "(Error) Se ha detectado un método de pago inactivo con este nombre.",
        409,
        "PAYMENT_EXISTS_INACTIVE",
        { existingId: duplicate.id }
      );
    } else {
      data.name = name;
      data.normalizedName = normalizedName;
    }
  }

  if (idAccount !== undefined) {
    validateNumberID(idAccount, "Cuenta");
    const account = await getAccountById(idAccount);
    data.account = account;
  }

  await paymentRepo.update(id, data);
  return await paymentRepo.findOneBy({ id });
};

export const reactivatePayment = async (id: number) => {
  validateNumberID(id, "Método de pago");
  const existing = await paymentRepo.findOneBy({ id });
  if (!existing)
    throw new AppError("(Error) Método de pago no encontrado.", 404);
  if (existing.active) {
    throw new AppError(
      "(Error) El método de pago ya está activo.",
      409,
      "PAYMENT_ALREADY_ACTIVE",
      { existingId: existing.id }
    );
  }
  await paymentRepo.update(id, { active: true });
  return await paymentRepo.findOneBy({ id });
};

export const softDeletePayment = async (id: number) => {
  validateNumberID(id, "Método de pago");

  const existing = await paymentRepo.findOneBy({ id, active: true });
  if (!existing)
    throw new AppError("(Error) Método de pago no encontrado.", 404);
  await paymentRepo.update(id, { active: false });
};

// SERVICE FOR GETTING ALL BARTABLES
export const getAllPayments = async (
  includeInactive: boolean,
  sort?: { field?: "name" | "acount" | "active"; direction?: "ASC" | "DESC" }
) => {
  const where = includeInactive ? {} : { active: true };
  const order: Record<string, "ASC" | "DESC"> = {};
  const field =
    sort?.field === "name" ? "normalizedName" : sort?.field ?? "normalizedName";
  const direction = sort?.direction ?? "ASC";
  order[field] = direction;
  return await paymentRepo.find({ where, order });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getPaymentById = async (id: number) => {
  validateNumberID(id, "Método de pago");
  const existing = await paymentRepo.findOne({
    where: { id, active: true },
    relations: { account: true },
  });
  if (!existing)
    throw new AppError("(Error) Método de pago no encontrado.", 404);
  return existing;
};
