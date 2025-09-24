import { AppDataSource } from "../data-source.js";
import { Sale } from "../entities/Sale.js";

export const saleRepo = AppDataSource.getRepository(Sale);
