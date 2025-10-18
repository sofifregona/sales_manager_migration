import { saleRepo } from "./sale.repo.js";
import { Sale } from "./sale.entity.js";
import { AppError } from "../../shared/errors/AppError.js";

import {
  validateNumber,
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
import { Raw, type FindOptionsWhere } from "typeorm";
import { accountRepo } from "../account/account.repo.js";
import { transactionRepo } from "../transaction/transaction.repo.js";
import { createTransaction } from "../transaction/transaction.service.js";

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
      throw new AppError(
        "(Error) Ya existe una venta activa para la mesa seleccionada.",
        409,
        "SALE_ALREADY_EXISTS",
        { existingId: duplicate.id }
      );
    }
    validateNumberID(idBartable, "Mesa");
    bartable = await getBartableById(idBartable);
  }

  if (idEmployee !== null) {
    const duplicate = await saleRepo.findOne({
      where: { employee: { id: idEmployee }, open: true },
    });
    if (duplicate) {
      throw new AppError(
        "(Error) Ya existe una venta activa para el empleado seleccionado.",
        409,
        "SALE_ALREADY_EXISTS",
        { existingId: duplicate.id }
      );
    }
    validateNumberID(idEmployee, "Empleado");
    employee = await getEmployeeById(idEmployee);
  }

  if (bartable && employee) {
    throw new AppError(
      "(Error) Una venta no puede asignarse a una mesa y a un empleado al mismo tiempo",
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
  product: { idProduct: number; op: string } | null;
  idPayment: number | null;
  open: boolean;
}) => {
  const { id, product, idPayment, open } = updatedData;
  const employeeDisc = 0.2;

  validateNumberID(id, "Venta");
  const actualSale = await getSaleById(id);

  if (!actualSale.open) {
    throw new AppError(
      "(Error) No se puede reabrir una venta que ya ha sido cerrada.",
      400
    );
  }

  let total = Number(actualSale.total);
  if (product?.idProduct) {
    const { idProduct, op } = product;

    validateNumberID(idProduct, "Producto");
    const productData = await getProductById(idProduct);
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
  if (idPayment) {
    validatePositiveInteger(idPayment, "Método de pago");
    const payment = await getPaymentById(idPayment);
    if (!payment) {
      throw new AppError(
        "(Error) No se pudo encontrar el método de pago.",
        400
      );
    }

    const newTransaction = await createTransaction({
      idAccount: payment.account.id,
      type: "income",
      amount: Number(total),
      origin: "sale",
      idSale: id,
      description: `ID Venta: ${id}`,
    });
    await transactionRepo.save(newTransaction);
    return await saleRepo.update({ id }, { payment, open });
  }

  if (!open && !idPayment) {
    throw new AppError(
      "(Error) Debe elegir un método de pago antes de cerrar la venta.",
      400
    );
  }

  await saleRepo.update({ id }, { total, open });
  return await saleRepo.findOneBy({ id });
};

export const deleteSale = async (id: number) => {
  validateNumberID(id, "Venta");

  const existing = await saleRepo.findOneBy({ id });
  if (!existing) throw new AppError("(Error) Venta no encontrada.", 404);
  await saleRepo.delete(id);
};

// SERVICE FOR GETTING ALL OPEN SALES
export const getAllOpenSales = async () => {
  return await saleRepo.find({
    where: {
      open: true,
    },
    relations: { bartable: true, employee: true },
  });
};

export const getListOfSales = async (filter: {
  startedDate: string;
  finalDate: string;
  groupBy: string;
}) => {
  const sDate = `${filter.startedDate} 00:00:00.000000`; // inclusive
  const fDate = `${filter.finalDate} 23:59:59.999999`;
  const where: FindOptionsWhere<Sale> = {
    dateTime: Raw((alias) => `${alias} >= :start AND ${alias} < :end`, {
      start: sDate,
      end: fDate,
    }),
  };
  let sales = {};
  if (filter.groupBy === "sale") {
    sales = await saleRepo.find({
      where,
      relations: {
        bartable: true,
        employee: true,
        products: { product: true },
      }, // equivalente a leftJoinAndSelect
      order: { dateTime: "DESC" },
    });
  } else if (filter.groupBy === "product") {
    const salesQuery = await saleRepo
      .createQueryBuilder("s")
      .setFindOptions({ where }) // reutiliza tu where (TypeORM 0.3+)
      .innerJoin("s.products", "ps")
      .innerJoin("ps.product", "p")
      .select("p.id", "groupId")
      .addSelect("p.name", "groupName")
      .addSelect("SUM(ps.quantity)", "units")
      .addSelect("SUM(ps.subtotal)", "total")
      .groupBy("p.id")
      .addGroupBy("p.name")
      .orderBy("total", "DESC")
      .getRawMany();
    sales = salesQuery.map((r) => ({
      groupId: Number(r.groupId),
      groupName: r.groupName,
      units: Number(r.units),
      total: Number(r.total),
    }));
  } else {
    const salesQuery = await saleRepo
      .createQueryBuilder("s")
      .setFindOptions({ where }) // tus filtros sobre s.*
      .innerJoin("s.products", "ps")
      .innerJoin("ps.product", "p")
      .leftJoin(`p.${filter.groupBy}`, "g") // ðŸ‘ˆ LEFT join para no perder NULL
      .select("COALESCE(g.id, 0)", "groupId") // id â€œfalsoâ€ para el bucket Otros
      .addSelect("COALESCE(g.name, 'Otros')", "groupName")
      .addSelect("SUM(ps.quantity)", "units")
      .addSelect("ROUND(SUM(ps.subtotal), 2)", "total")
      .groupBy("COALESCE(g.id, 0)")
      .addGroupBy("COALESCE(g.name, 'Otros')")
      .orderBy("total", "DESC")
      .getRawMany();
    sales = salesQuery.map((r) => ({
      groupId: Number(r.groupId),
      groupName: r.groupName,
      units: Number(r.units),
      total: Number(r.total),
    }));
  }
  return sales;
};

// SERVICE FOR GETTING A SALE BY ID
export const getSaleById = async (id: number) => {
  validateNumberID(id, "Venta");
  const existing = await saleRepo.findOne({
    where: { id, open: true },
    relations: { products: { product: true }, bartable: true, employee: true },
  });
  if (!existing) throw new AppError("(Error) Venta no encontrada", 404);
  return existing;
};
