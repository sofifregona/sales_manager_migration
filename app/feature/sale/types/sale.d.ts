import type { Flash } from "~/types/flash";
import type { AccountDTO } from "~/feature/account/account";
import type { BartableDTO } from "~/feature/bartable/bartable";
import type { CategoryDTO } from "~/feature/category/category";
import type { EmployeeDTO } from "~/feature/employee/employee";
import type { PaymentDTO } from "~/feature/payment/payment";
import type { ProductDTO } from "~/feature/product/product";
import type { GroupedProductSoldDTO, ProductSoldDTO } from "./productSold";

export interface SaleDTO {
  id: number;
  dateTime: Date;
  total: number;
  bartable?: BartableDTO | null;
  employee?: EmployeeDTO | null;
  open: boolean;
  hasDiscount: boolean;
  discount: number;
  payment: PaymentDTO | null;
  products: ProductSoldDTO[] | [];
}

export interface GroupedSaleDTO {
  groupId: number;
  groupName: string;
  units: number;
  total: number;
}

type SaleGroup = "sale" | "product" | "brand" | "category" | "provider";

interface TotalSalesBase<TGroup extends SaleGroup> {
  groupBy: TGroup;
  label: string;
  total: number;
}

export interface TotalSalesBySale extends TotalSalesBase<"sale"> {
  sales: SaleDTO[];
}

export interface TotalSalesByGrouping
  extends TotalSalesBase<Exclude<SaleGroup, "sale">> {
  sales: GroupedSaleDTO[];
}

export type TotalSalesDTO = TotalSalesBySale | TotalSalesByGrouping;

export interface CreateSalePayload {
  idBartable?: number | null;
  idEmployee?: number | null;
}

export interface UpdateSalePayload extends Partial<CreateSalePayload> {
  id: number;
  product: { idProduct?: number; op?: string };
}

export interface CloseSalePayload {
  id: number;
  idPayment: number;
}

export interface SaleListLoaderData {
  sales: SaleDTO[];
  bartables: BartableDTO[];
  employees: EmployeeDTO[];
}

export interface SaleListFilterLoaderData {
  accounts: AccountDTO[];
  totalSales: TotalSalesDTO;
  flash: Flash;
}

type SaleLoaderBase = {
  sale: SaleDTO;
  products: ProductDTO[];
  categories: CategoryDTO[];
  payments: PaymentDTO[];
};

export type SaleLoaderData =
  | (SaleLoaderBase & { propType: "bartable"; prop: BartableDTO })
  | (SaleLoaderBase & { propType: "employee"; prop: EmployeeDTO });
