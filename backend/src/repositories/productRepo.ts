import { AppDataSource } from "../data-source.js";
import { Product } from "../entities/Product.js";

export const productRepo = AppDataSource.getRepository(Product);
