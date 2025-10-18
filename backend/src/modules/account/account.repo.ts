import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Account } from "./account.entity.js";

export const accountRepo = AppDataSource.getRepository(Account);
