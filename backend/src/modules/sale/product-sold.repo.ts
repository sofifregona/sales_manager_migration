import { AppDataSource } from "../../shared/database/data-source.js";
import { ProductSold } from "./product-sold.entity.js";

export const productSoldRepo = AppDataSource.getRepository(ProductSold);
