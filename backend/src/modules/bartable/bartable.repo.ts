import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Bartable } from "./bartable.entity.js";

export const bartableRepo = AppDataSource.getRepository(Bartable);
