import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Transaction } from "./transaction.entity.js";

export const transactionRepo = AppDataSource.getRepository(Transaction);
