import { saleRepo } from "../repositories/saleRepo.js";
import { Sale } from "../entities/Sale.js";
import { AppError } from "../errors/AppError.js";

import { validateNumberID } from "../utils/validations/validationHelpers.js";
import { Bartable } from "../entities/Bartable.js";
import type { Employee } from "../entities/Employee.js";
import { getBartableById } from "./bartableService.js";
import { getEmployeeById } from "./employeeService.js";

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

// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
// export const updateSale = async (updatedData: {
//   id: number;
//   name?: string;
//   cuit?: number | null;
//   telephone?: number | null;
//   email?: string | null;
//   address?: string | null;
//   active?: boolean;
// }) => {
//   const { id, name, cuit, telephone, email, address, active } = updatedData;
//   validateNumberID(id);
//   const existing = await saleRepo.findOneBy({ id, active: true });
//   if (!existing) throw new AppError("Proveedor no encontrado", 404);

//   const data: Partial<Sale> = {};

//   if (name !== undefined) {
//     const normalizedName = normalizeText(name);
//     const duplicate = await saleRepo.findOneBy({ normalizedName });
//     if (duplicate && duplicate.id !== id && duplicate.active) {
//       throw new AppError("Ya existe una categoría con este nombre", 409);
//     }
//     if (duplicate && !duplicate.active) {
//       data.active = true;
//       await saleRepo.update(duplicate.id, data);
//       data.name = existing.name;
//       data.normalizedName = existing.normalizedName;
//       data.active = false;
//     } else {
//       data.name = name;
//       data.normalizedName = normalizedName;
//     }
//   }

//   if (cuit !== undefined) {
//     if (cuit !== null) {
//       validateCUI(cuit, 11);
//       const duplicate = await saleRepo.findOneBy({ cuit });
//       if (duplicate && duplicate.id !== id && duplicate.active) {
//         throw new AppError("Ya existe un proveedor con este cuit.", 409);
//       }
//     }
//     data.cuit = cuit;
//   }

//   if (telephone !== undefined) {
//     if (telephone !== null) {
//       validateTelephone(telephone);
//     }
//     data.telephone = telephone;
//   }

//   if (email !== undefined) {
//     if (email !== null) {
//       validateEmailFormat(email);
//     }
//     data.email = email;
//   }

//   if (address !== undefined) {
//     data.address = address;
//   }

//   if (active !== undefined) {
//     data.active = active;
//   }
//   await saleRepo.update(id, data);
//   return await saleRepo.findOneBy({ id });
// };

// SERVICE FOR GETTING ALL BARTABLES
export const getAllSales = async () => {
  return await saleRepo.find({
    where: {
      open: true,
    },
    relations: { bartable: true, employee: true },
  });
};

// SERVICE FOR GETTING A BARTABLE BY ID
export const getSaleById = async (id: number) => {
  validateNumberID(id);
  const existing = await saleRepo.findOne({
    where: { id, open: true },
    relations: { bartable: true, employee: true },
  });
  if (!existing) throw new AppError("Venta no encontrada", 404);
  return existing;
};
