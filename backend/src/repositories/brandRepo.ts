import { AppDataSource } from "../data-source.js";
import { Brand } from "../entities/Brand.js";

export const brandRepo = AppDataSource.getRepository(Brand);
