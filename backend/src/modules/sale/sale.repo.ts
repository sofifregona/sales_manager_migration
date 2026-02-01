import type { Payment } from "./payment.entity.js";
import type { Sale } from "./sale.entity.js";

export type GroupKey = "product" | "category" | "brand" | "provider";
export type GroupedRow = {
  groupId: number;
  groupName: string;
  units: number;
  total: number;
};

export interface SaleRepository {
  create(
    data: Pick<
      Sale,
      | "createdDateTime"
      | "createdBy"
      | "total"
      | "bartable"
      | "employee"
      | "open"
      | "discount"
      | "products"
    >
  ): Sale;
  save(entity: Sale): Promise<Sale>;

  findById(id: number): Promise<Sale | null>;
  findOpenById(id: number): Promise<Sale | null>;
  findOpenByBartableId(bartableId: number): Promise<Sale | null>;
  findOpenByEmployeeId(employeeId: number): Promise<Sale | null>;

  getAllOpen(): Promise<Sale[]>;
  getList(from: Date, to: Date): Promise<Sale[]>;
  getGrouped(from: Date, to: Date, groupBy: GroupKey): Promise<GroupedRow[]>;

  updateTotal(id: number, total: number): Promise<void>;
  closeSale(id: number): Promise<void>;
  delete(id: number): Promise<void>;
}
