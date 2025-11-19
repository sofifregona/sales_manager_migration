import type { SaleRepository } from "./sale.repo.js";
import { AppError } from "../../shared/errors/AppError.js";

import {
  validateNumberID,
  validatePositiveInteger,
} from "../../shared/utils/validations/validationHelpers.js";
import { Bartable } from "../bartable/bartable.entity.js";
import type { Employee } from "../employee/employee.entity.js";
import { getBartableById } from "../bartable/bartable.service.js";
import { getEmployeeById } from "../employee/employee.service.js";
import { getProductById } from "../product/product.service.js";
import { productSoldRepo } from "./product-sold.repo.js";
import { getPaymentById } from "../payment/payment.service.js";

import { createTransaction } from "../transaction/transaction.service.js";
import { makeBartableRepository } from "../bartable/bartable.repo.typeorm.js";
import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { makeEmployeeRepository } from "../employee/employee.repo.typeorm.js";
import { makeProductRepository } from "../product/product.repo.typeorm.js";
import { makePaymentRepository } from "../payment/payment.repo.typeorm.js";
import { makeUserRepository } from "../user/user.repo.typeorm.js";
import { getUserById } from "../user/user.service.js";

const bartableRepo = makeBartableRepository(AppDataSource);
const employeeRepo = makeEmployeeRepository(AppDataSource);
const productRepo = makeProductRepository(AppDataSource);
const paymentRepo = makePaymentRepository(AppDataSource);
const userRepo = makeUserRepository(AppDataSource);

// SERVICE FOR CREATE A BARTABLE
export const createSale = async (
  repo: SaleRepository,
  data: {
    idBartable: number | null;
    idEmployee: number | null;
    createdById: number;
  }
) => {
  const { idBartable, idEmployee, createdById } = data;
  let bartable: Bartable | null = null;
  let employee: Employee | null = null;

  if (idBartable !== null) {
    const duplicate = await repo.findOpenByBartableId(idBartable);
    if (duplicate) {
      throw new AppError(
        "(Error) Ya existe una venta activa para la mesa seleccionada.",
        409,
        "SALE_ALREADY_EXISTS",
        { existingId: duplicate.id }
      );
    }
    validateNumberID(idBartable, "Mesa");
    bartable = await getBartableById(bartableRepo, idBartable);
  }

  if (idEmployee !== null) {
    const duplicate = await repo.findOpenByEmployeeId(idEmployee);
    if (duplicate) {
      throw new AppError(
        "(Error) Ya existe una venta activa para el empleado seleccionado.",
        409,
        "SALE_ALREADY_EXISTS",
        { existingId: duplicate.id }
      );
    }
    validateNumberID(idEmployee, "Empleado");
    employee = await getEmployeeById(employeeRepo, idEmployee);
  }

  if (bartable && employee) {
    throw new AppError(
      "(Error) Una venta no puede asignarse a una mesa y a un empleado al mismo tiempo",
      400
    );
  }

  const user = await getUserById(userRepo, createdById);
  if (!user) {
    throw new AppError("(Error) Usuario no encontrado.", 400);
  }

  const newSale = repo.create({
    dateTime: new Date(),
    createdBy: user,
    total: 0,
    open: true,
    bartable: bartable,
    employee: employee,
    discount: employee ? 0.2 : 0,
    payment: null,
    products: [],
  });

  return await repo.save(newSale);
};

// SERVICE FOR UPDATE A SALE
export const updateSale = async (
  repo: SaleRepository,
  updatedData: {
    id: number;
    product: { idProduct: number; op: "add" | "subtract" };
  }
) => {
  const { id, product } = updatedData;
  const employeeDisc = 0.2;

  validateNumberID(id, "Venta");
  const actualSale = await getOpenSaleById(repo, id);
  if (!actualSale) {
    throw new AppError("(Error) Venta no encontrada.", 400);
  }

  if (!actualSale.open) {
    throw new AppError(
      "(Error) No se puede reabrir una venta que ya ha sido cerrada.",
      400
    );
  }

  if (!product) {
    throw new AppError("(Error) Debe indicar el producto a modificar.", 400);
  }

  let total = Number(actualSale.total);
  if (product?.idProduct) {
    const { idProduct, op } = product;

    validateNumberID(idProduct, "Producto");
    const productData = await getProductById(productRepo, idProduct);
    if (!productData) {
      throw new AppError(
        "(Error) El producto que está intentando modificar no se ha encontrado.",
        400
      );
    }
    const price = actualSale.employee
      ? productData.price * (1 - employeeDisc)
      : productData.price;
    const existingItem = actualSale.products?.find(
      (p) => p.product.id === idProduct
    );

    if (existingItem) {
      let newQuantity: number;
      op === "add"
        ? (newQuantity = existingItem.quantity + 1)
        : (newQuantity = existingItem.quantity - 1);
      if (newQuantity > 0) {
        const newSubtotal = newQuantity * price;
        await productSoldRepo.update(
          { id: existingItem.id },
          { quantity: newQuantity, subtotal: newSubtotal }
        );
      } else {
        await productSoldRepo.delete({ id: existingItem.id });
      }
      newQuantity > existingItem.quantity ? (total += price) : (total -= price);
    } else {
      await productSoldRepo.insert({
        product: productData,
        quantity: 1,
        subtotal: price,
        sale: actualSale,
      });
      total += price;
    }
  }

  await repo.updateTotal(id, total);
  return await repo.findById(id);
};

export const closeSale = async (
  repo: SaleRepository,
  updatedData: {
    id: number;
    idPayment: number;
    closedById: number;
  }
) => {
  const { id, idPayment, closedById } = updatedData;

  validateNumberID(id, "Venta");
  const actualSale = await repo.findOpenById(id);

  if (!actualSale) {
    throw new AppError("(Error) No se ha encontrado la venta.", 400);
  }

  validatePositiveInteger(idPayment, "Método de pago");
  const payment = await getPaymentById(paymentRepo, idPayment);
  if (!payment) {
    throw new AppError("(Error) No se pudo encontrar el método de pago.", 400);
  }

  await createTransaction({
    idAccount: payment.account.id,
    type: "income",
    amount: Number(actualSale.total),
    origin: "sale",
    idSale: id,
    description: `ID Venta: ${id}`,
    createdById: closedById,
  });
  await repo.closeSale(id, idPayment);
  return await repo.findById(id);
};

export const deleteSale = async (
  repo: SaleRepository,
  data: { id: number; force?: boolean }
) => {
  const { id, force } = data;
  validateNumberID(id, "Venta");

  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Venta no encontrada.", 404);

  const hasProducts = (existing.products?.length ?? 0) > 0;
  const isOpen = Boolean(existing.open);

  if (!force) {
    if (!isOpen) {
      throw new AppError(
        "(Error) Solo un administrador puede eliminar una venta cerrada.",
        403,
        "SALE_DELETE_CLOSED"
      );
    }
    if (hasProducts) {
      throw new AppError(
        "(Error) Solo un administrador puede eliminar una venta que tiene productos cargados.",
        403,
        "SALE_DELETE_WITH_PRODUCTS"
      );
    }
  }

  await repo.delete(id);
  return existing;
};

// SERVICE FOR GETTING ALL OPEN SALES
export const getAllOpenSales = async (repo: SaleRepository) => {
  return await repo.getAllOpen();
};

export const getListOfSales = async (
  repo: SaleRepository,
  filter: {
    startedDate: string;
    finalDate: string;
    groupBy: string;
  }
) => {
  const sDate = `${filter.startedDate} 00:00:00.000000`; // inclusive
  const fDate = `${filter.finalDate} 23:59:59.999999`;
  let sales = {};
  if (filter.groupBy === "sale") {
    sales = await repo.getList(new Date(sDate), new Date(fDate));
  } else if (filter.groupBy === "product") {
    sales = await repo.getGrouped(new Date(sDate), new Date(fDate), "product");
  } else {
    sales = await repo.getGrouped(
      new Date(sDate),
      new Date(fDate),
      filter.groupBy as any
    );
  }
  return sales;
};

// SERVICE FOR GETTING A SALE BY ID
export const getSaleById = async (
  repo: SaleRepository,
  id: number
) => {
  validateNumberID(id, "Venta");
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("(Error) Venta no encontrada", 404);
  return existing;
};

export const getOpenSaleById = async (
  repo: SaleRepository,
  id: number
) => {
  validateNumberID(id, "Venta");
  const existing = await repo.findOpenById(id);
  if (!existing) {
    throw new AppError(
      "(Error) Venta abierta no encontrada o ya cerrada.",
      404
    );
  }
  return existing;
};

export const getOpenSaleByBartableId = async (
  repo: SaleRepository,
  bartableId: number
) => {
  validateNumberID(bartableId, "Mesa");
  const sale = await repo.findOpenByBartableId(bartableId);
  if (!sale) {
    throw new AppError("(Error) No hay una venta abierta para esta mesa.", 404);
  }
  return sale;
};

export const getOpenSaleByEmployeeId = async (
  repo: SaleRepository,
  employeeId: number
) => {
  validateNumberID(employeeId, "Empleado");
  const sale = await repo.findOpenByEmployeeId(employeeId);
  if (!sale) {
    throw new AppError(
      "(Error) No hay una venta abierta para este empleado.",
      404
    );
  }
  return sale;
};

