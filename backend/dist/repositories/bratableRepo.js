import { AppDataSource } from "../data-source.js";
import { Bartable } from "../entities/Bartable.js";
export const bartableRepo = AppDataSource.getRepository(Bartable);
