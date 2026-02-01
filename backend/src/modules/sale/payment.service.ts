import type { ProductSoldRepository } from "./product-sold.repo.js";
import { AppError } from "@back/src/shared/errors/AppError.js";
import {
  validateNumberID,
  validatePositiveInteger,
  validatePositiveNumber,
  validateRangeLength,
} from "@back/src/shared/utils/validations/validationHelpers.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { getAccountById } from "../account/account.service.js";
import type { ProductSold } from "./product-sold.entity.js";
import { makeSaleRepository } from "./sale.repo.typeorm.js";
import { makePaymentMethodRepository } from "../paymentMethod/payment-method.repo.typeorm.js";
import { getProductById } from "../product/product.service.js";
import { getSaleById } from "./sale.service.js";
import type { Product } from "../product/product.entity.js";
import type { Sale } from "./sale.entity.js";
import type { PaymentRepository } from "./payment.repo.js";
import type { PaymentMethod } from "../paymentMethod/payment-method.entity.js";
import { getPaymentMethodById } from "../paymentMethod/payment-method.service.js";
import { getProductSoldById } from "./product-sold.service.js";
import { makeProductSoldRepository } from "./product-sold.repo.typeorm.js";
import { createTransaction } from "../transaction/transaction.service.js";
import { getUserById } from "../user/user.service.js";
import { makeUserRepository } from "../user/user.repo.typeorm.js";
import type { Payment } from "./payment.entity.js";

const saleRepo = makeSaleRepository(AppDataSource);
const paymentMethodRepo = makePaymentMethodRepository(AppDataSource);
const productSoldRepo = makeProductSoldRepository(AppDataSource);
const userRepo = makeUserRepository(AppDataSource);

export const createPayment = async (
  repo: PaymentRepository,
  sale: Sale,
  paymentDetails: {
    createdById: number;
    idPaymentMethod: number;
    amount: number;
    idProductSolds?: number[];
  }
) => {
  const { createdById, idPaymentMethod, amount, idProductSolds } =
    paymentDetails;
  validatePositiveNumber(amount, "Monto");
  const paymentMethod = await getPaymentMethodById(
    paymentMethodRepo,
    idPaymentMethod
  );

  const user = await getUserById(userRepo, createdById);

  const entity = repo.create({
    createdBy: user,
    sale,
    paymentMethod,
    amount,
  });
  if (entity) {
    if (idProductSolds?.length !== 0) {
      idProductSolds?.map(async (id) => {
        const productSold = await getProductSoldById(productSoldRepo, id);
        if (!productSold) {
          throw new AppError("(Error) Producto vendido no encontrado.", 404);
        }
        productSold.payment = entity;
        await productSoldRepo.save(productSold);
      });
    }

    await createTransaction({
      idAccount: paymentMethod.account.id,
      type: "income",
      amount: amount,
      origin: "sale",
      payment: entity,
      description: `ID Venta: ${sale.id}`,
      createdById: createdById,
    });
  }
  return await repo.save(entity);
};

export const deletePayment = async (repo: PaymentRepository, id: number) => {
  validateNumberID(id, "Pago");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Pago no encontrado", 404);
  await repo.delete(id);
};

export const getPaymentById = async (
  repo: PaymentRepository,
  id: number
): Promise<Payment> => {
  validateNumberID(id, "Pago");
  const payment = await repo.findById(id);
  if (!payment) throw new AppError("(Error) Pago no encontrado.", 404);
  return payment;
};
