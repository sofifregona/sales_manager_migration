import { Bartable } from "./bartable";
import { Discount } from "./discount";
import { Employee } from "./employee";
import type { ProductSold } from "./productSold";

export interface Sale {
  id: number;
  dateTime: Date;
  total: number;
  bartable?: Bartable | null;
  employee?: Employee | null;
  open: boolean;
  hasDiscount: boolean;
  discount: number;
  payment: Payment | null;
  productsSold: ProductSold[] | null;
}

export interface CreateSaleFormData {
  idBartable?: number | null;
  idEmployee?: number | null;
}

export interface UpdateSaleFormData extends Partial<CreateSaleFormData> {
  id: number;
  idPayment: number;
  open: boolean;
  productsSold?: Array<
    | { productId: number; quantity: number } // create (sin id) o update (con id)
    | { id: number; _delete: true } // delete
  >;
}
