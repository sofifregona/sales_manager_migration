import { AppDataSource } from "../../shared/database/data-source.js";
import { Sale } from "./sale.entity.js";

export const saleRepo = AppDataSource.getRepository(Sale);
