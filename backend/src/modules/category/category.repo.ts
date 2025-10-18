import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Category } from "./category.entity.js";

export const categoryRepo = AppDataSource.getRepository(Category);
