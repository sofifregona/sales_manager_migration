import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Payment } from "./payment.entity.js";

export const paymentRepo = AppDataSource.getRepository(Payment);
