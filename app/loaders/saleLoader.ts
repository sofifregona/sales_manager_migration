import type { LoaderFunctionArgs } from "react-router";
import { getAllSales, getSaleById } from "~/api/sale";
import { getAllBartables, getBartableById } from "~/api/bartable";
import { getAllEmployees, getEmployeeById } from "~/api/employee";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";
import { getAllPayments } from "~/api/payment";
import { getListOfProducts } from "~/api/product";
import { getAllCategories } from "~/api/category";

export async function saleListLoader() {
  try {
    const bartables = await getAllBartables();
    const employees = await getAllEmployees();
    const sales = await getAllSales();

    return {
      sales: sales ?? [],
      bartables: bartables ?? [],
      employees: employees ?? [],
    };
  } catch (error) {
    let parsed = {
      message: "Error al obtener la lista de ventas",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
}

export const saleLoader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const filters = {
    name: url.searchParams.get("name") ?? undefined,
    code: url.searchParams.get("code") ?? undefined,
    sortField: "name",
    sortDirection: "asc",
  };

  const idRequiredError = validateRequiredID(params.id, "VENTA");
  if (idRequiredError) {
    throw new Error(idRequiredError.error);
  }

  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "VENTA");
  if (idNumberError) {
    throw new Error(idNumberError.error);
  }

  try {
    const [sale, products, categories, payments] = await Promise.all([
      getSaleById(id),
      getListOfProducts(filters),
      getAllCategories(),
      getAllPayments(),
    ]);

    const idBartable = sale.bartable?.id ?? null;
    const idEmployee = sale.employee?.id ?? null;

    if (idBartable !== null) {
      const prop = await getBartableById(idBartable);
      return {
        sale,
        products,
        categories,
        payments,
        prop,
        propType: "bartable" as const,
      };
    }

    if (idEmployee !== null) {
      const prop = await getEmployeeById(idEmployee);
      return {
        sale,
        products,
        categories,
        payments,
        prop,
        propType: "employee" as const,
      };
    }
  } catch (error) {
    let parsed = { message: "Error al obtener la venta", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
};
