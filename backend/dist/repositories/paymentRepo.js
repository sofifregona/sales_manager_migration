import { AppDataSource } from "../data-source.js";
import { Payment } from "../entities/Payment.js";
export const paymentRepo = AppDataSource.getRepository(Payment);
