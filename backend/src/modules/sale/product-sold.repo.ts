import type { Payment } from "./payment.entity.js";
import type { ProductSold } from "./product-sold.entity.js";

// Interfaz alineada al patrón de AccountRepository
export interface ProductSoldRepository {
  create(
    data: Pick<ProductSold, "product" | "quantity" | "subtotal" | "sale">
  ): ProductSold;
  save(entity: ProductSold): Promise<ProductSold>;
  findById(id: number): Promise<ProductSold | null>;
  updateFields(
    id: number,
    patch: Partial<Pick<ProductSold, "quantity" | "subtotal" | "payment">>
  ): Promise<void>;
  assignPayment(id: number, payment: Payment): Promise<void>;
  delete(id: number): Promise<void>;
}
