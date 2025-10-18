import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Brand } from "./brand.entity.js";

export const brandRepo = AppDataSource.getRepository(Brand);
