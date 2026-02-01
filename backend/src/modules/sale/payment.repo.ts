import { Payment } from "./payment.entity.js";

// Interfaz alineada al patrón de AccountRepository
export interface PaymentRepository {
  create(
    data: Pick<Payment, "createdBy" | "sale" | "paymentMethod" | "amount">
  ): Payment;
  save(entity: Payment): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
  delete(id: number): Promise<void>;
}
