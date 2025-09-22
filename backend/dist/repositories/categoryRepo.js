import { AppDataSource } from "../data-source.js";
import { Category } from "../entities/Category.js";
export const categoryRepo = AppDataSource.getRepository(Category);
