import { Bartable } from "./bartable";
import { Discount } from "./discount";
import { Employee } from "./employee";
<<<<<<< HEAD
import type { ProductSold } from "./productSold";
=======
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87

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
<<<<<<< HEAD
  productsSold: ProductSold[] | null;
=======
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
}

export interface CreateSaleFormData {
  idBartable?: number | null;
  idEmployee?: number | null;
<<<<<<< HEAD
  hasDiscount: boolean;
=======
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
}

export interface UpdateSaleFormData extends Partial<CreateSaleFormData> {
  id: number;
<<<<<<< HEAD
  idPayment: number;
  open: boolean;
  productsSold?: Array<
    | { productId: number; quantity: number } // create (sin id) o update (con id)
    | { id: number; _delete: true } // delete
  >;
=======
  hasDiscount: boolean;
  idPayment: number;
  open: boolean;
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
}
