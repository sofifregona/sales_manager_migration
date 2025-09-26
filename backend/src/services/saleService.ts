import { saleRepo } from "../repositories/saleRepo.js";
import { Sale } from "../entities/Sale.js";
import { AppError } from "../errors/AppError.js";

import {
  validateNumber,
  validateNumberID,
  validatePositiveInteger,
} from "../utils/validations/validationHelpers.js";
import { Bartable } from "../entities/Bartable.js";
import type { Employee } from "../entities/Employee.js";
import { getBartableById } from "./bartableService.js";
import { getEmployeeById } from "./employeeService.js";
import { getProductById } from "./productService.js";
import { productSoldRepo } from "../repositories/productSoldRepo.js";
import { getPaymentById } from "./paymentService.js";

// SERVICE FOR CREATE A BARTABLE
export const createSale = async (data: {
  idBartable: number | null;
  idEmployee: number | null;
}) => {
  const { idBartable, idEmployee } = data;
  let bartable: Bartable | null = null;
  let employee: Employee | null = null;

  if (idBartable !== null) {
    const duplicate = await saleRepo.findOne({
      where: { bartable: { id: idBartable }, open: true },
    });
    if (duplicate) {
      throw new AppError("Ya existe una venta abierta en esta mesa", 409);
    }
    validateNumberID(idBartable);
    bartable = await getBartableById(idBartable);
  }

  if (idEmployee !== null) {
    const duplicate = await saleRepo.findOne({
      where: { bartable: { id: idEmployee }, open: true },
    });
    if (duplicate) {
      throw new AppError("Ya existe una venta abierta para este empleado", 409);
    }
    validateNumberID(idEmployee);
    employee = await getEmployeeById(idEmployee);
  }

  if (bartable && employee) {
    throw new AppError(
      "Una venta no puede asignarse a una mesa y a un empleado al mismo tiempo",
      400
    );
  }

  const newSale = Object.assign(new Sale(), {
    dateTime: new Date(),
    total: 0,
    open: true,
    bartable: bartable,
    employee: employee,
    discount: employee ? 0.2 : 0,
    payment: null,
    products: null,
  });

  return await saleRepo.save(newSale);
};

// SERVICE FOR UPDATE A SALE
export const updateSale = async (updatedData: {
  id: number;
  productsSold: { idProduct: number; op: string } | null;
  idPayment: number | null;
  open: boolean;
}) => {
  const { id, productsSold, idPayment, open } = updatedData;
  validateNumberID(id);
  const actualSale = await getSaleById(id);

  if (!actualSale.open) {
    throw new AppError(
      "No se puede reabrir una venta que ya ha sido cerrada",
      400
    );
  }

  const data: Partial<Sale> = {};

  if (productsSold) {
    const { idProduct, op } = productsSold;
    validateNumberID(idProduct);
    const product = await getProductById(idProduct);
    const existingItem = actualSale.products.find(
      (p) => p.product.id === idProduct
    );
    if (existingItem) {
      let newQuantity: number;
      op === "adition"
        ? (newQuantity = existingItem.quantity + 1)
        : op === "substract"
        ? (newQuantity = existingItem.quantity - 1)
        : (newQuantity = 0);
      const newSubtotal = newQuantity * product.price;
      if (newQuantity > 0) {
        await productSoldRepo.update(
          { id: existingItem.id },
          { quantity: newQuantity, subtotal: newSubtotal }
        );
      } else {
        await productSoldRepo.delete({ id: existingItem.id });
      }
    } else {
      await productSoldRepo.create({
        product: product,
        quantity: 1,
        subtotal: product.price,
        sale: actualSale,
      });
    }
  }
  if (idPayment) {
    validatePositiveInteger(idPayment);
    const payment = await getPaymentById(idPayment);
    await saleRepo.update({ id }, { payment: payment });
  }
  return await saleRepo.findOneBy({ id });
};

// SERVICE FOR GETTING ALL OPEN SALES
export const getAllSales = async () => {
  return await saleRepo.find({
    where: {
      open: true,
    },
    relations: { bartable: true, employee: true },
  });
};

// SERVICE FOR GETTING A SALE BY ID
export const getSaleById = async (id: number) => {
  validateNumberID(id);
  const existing = await saleRepo.findOne({
    where: { id, open: true },
    relations: { bartable: true, employee: true },
  });
  if (!existing) throw new AppError("Venta no encontrada", 404);
  return existing;
};
