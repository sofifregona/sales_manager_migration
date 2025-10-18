import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { User } from "./user.entity.js";

export const userRepo = AppDataSource.getRepository(User);
