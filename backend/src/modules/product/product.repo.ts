import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Product } from "./product.entity.js";

export const productRepo = AppDataSource.getRepository(Product);
