import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { StockEntry } from "./stock-entry.entity.js";

export const stockRepo = AppDataSource.getRepository(StockEntry);
