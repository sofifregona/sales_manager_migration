import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import {
  getAllSales,
  getListOfSales,
  getSaleById,
} from "~/feature/sale/sale-api.server";
import {
  getAllBartables,
  getBartableById,
} from "~/feature/bartable/bartable-api.server";
import {
  getAllEmployees,
  getEmployeeById,
} from "~/feature/employee/employee-api.server";
import {
  validateRequiredId,
  validateNumberId,
} from "~/utils/validation/validationHelpers";
import { getAllPaymentMethods } from "~/feature/paymentMethod/payment-method-api.server";
import { getListOfProducts } from "~/feature/product/product-api.server";
import { getAllCategories } from "~/feature/category/category-api.server";
import { getAllAccounts } from "~/feature/account/account-api.server";
import { parseAppError } from "~/utils/errors/parseAppError";
import { jsonResponse } from "~/lib/http/jsonResponse";
import type {
  GroupedSaleDTO,
  SaleDTO,
  TotalSalesDTO,
  SaleListLoaderData,
  SaleListFilterLoaderData,
  SaleLoaderData,
} from "~/feature/sale/types/sale";
import type { Flash } from "~/types/flash";
import { formatDateTime } from "~/utils/formatters/formatDateTime";

type GroupBy = "sale" | "product" | "category" | "brand" | "provider";
const GROUP_LABELS: Record<GroupBy, string> = {
  sale: "Venta",
  product: "Producto",
  category: "Categoría",
  brand: "Marca",
  provider: "Proveedor",
};

export async function saleListLoader({
  request,
}: LoaderFunctionArgs): Promise<SaleListLoaderData> {
  return runWithRequest(request, async () => {
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
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de ventas."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  });
}

export async function saleListFilterLoader({
  request,
}: LoaderFunctionArgs): Promise<SaleListFilterLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {};
    const today = formatDateTime(new Date(), "yyyy-mm-dd");

    const groupParam = url.searchParams.get("groupBy") ?? "sale";
    const groupBy = groupParam as GroupBy;
    const label = GROUP_LABELS[groupBy];

    const filter = {
      startedDate: url.searchParams.get("startedDate") ?? today,
      finalDate: url.searchParams.get("finalDate") ?? today,
      groupBy,
    };

    const sDate = url.searchParams.get("startedDate");
    const fDate = url.searchParams.get("finalDate");

    if (sDate) {
      const initialDate = new Date(sDate);
      if (fDate) {
        const finalDate = new Date(fDate);
        if (initialDate > finalDate) {
          flash.error =
            "(Error) La fecha inicial no puede ser posterior a la fecha final.";
          flash.source = "client";
        }
        filter.startedDate = sDate;
        filter.finalDate = fDate;
      } else {
        flash.error =
          "(Error) Debe introducir una fecha final, igual o posterior a la fecha inicial.";
        flash.source = "client";
      }
    }

    try {
      const accounts = await getAllAccounts(false);

      if (groupBy === "sale") {
        const sales = (await getListOfSales(filter)) as SaleDTO[];
        const total = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalSales: TotalSalesDTO = {
          groupBy: "sale",
          label: GROUP_LABELS.sale,
          sales,
          total,
        };
        return { accounts, totalSales, flash };
      } else {
        const groupedSales = (await getListOfSales(filter)) as GroupedSaleDTO[];
        const total = groupedSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalSales: TotalSalesDTO = {
          groupBy,
          label,
          sales: groupedSales,
          total,
        };
        return { accounts, totalSales, flash };
      }
    } catch (error) {
      console.log("saleListFilterLoader error", error);
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de filtros."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  });
}

export const saleLoader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<SaleLoaderData> => {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);

    const filters = {
      name: url.searchParams.get("name") ?? undefined,
      code: url.searchParams.get("code") ?? undefined,
      sortField: "name",
      sortDirection: "asc",
    };

    const idRequiredError = validateRequiredId(params.id, "VENTA");
    if (idRequiredError) {
      throw new Error(idRequiredError.error);
    }

    const id = parseInt(params.id as string, 10);
    const idNumberError = validateNumberId(id, "VENTA");
    if (idNumberError) {
      throw new Error(idNumberError.error);
    }

    try {
      const [sale, products, categories, paymentMethods] = await Promise.all([
        getSaleById(id),
        getListOfProducts(filters),
        getAllCategories(),
        getAllPaymentMethods(),
      ]);

      const idBartable = sale.bartable?.id ?? null;
      const idEmployee = sale.employee?.id ?? null;

      if (idBartable !== null) {
        const prop = await getBartableById(idBartable);
        return {
          sale,
          products: products ?? [],
          categories: categories ?? [],
          paymentMethods: paymentMethods ?? [],
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
          paymentMethods,
          prop,
          propType: "employee" as const,
        };
      }
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la venta."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    throw new Error("La venta no tiene referencia de mesa ni empleado.");
  });
};
