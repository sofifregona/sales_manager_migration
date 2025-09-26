import { AppDataSource } from "../data-source.js";
import { ProductSold } from "../entities/ProductSold.js";

export const productSoldRepo = AppDataSource.getRepository(ProductSold);
