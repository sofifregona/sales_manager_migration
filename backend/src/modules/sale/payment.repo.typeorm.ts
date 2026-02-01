import { DataSource, Repository } from "typeorm";
import { Payment } from "./payment.entity.js";
import type { PaymentRepository } from "./payment.repo.js";

export function makePaymentRepository(ds: DataSource): PaymentRepository {
  const paymentRepo: Repository<Payment> = ds.getRepository(Payment);
  return {
    create(data) {
      return paymentRepo.create({ createdDateTime: new Date(), ...data });
    },
    save(entity) {
      return paymentRepo.save(entity);
    },
    async findById(id) {
      return paymentRepo.findOneBy({ id });
    },
    async delete(id) {
      await paymentRepo.delete(id);
    },
  };
}
