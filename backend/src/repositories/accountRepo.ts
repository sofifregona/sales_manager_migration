import { AppDataSource } from "../data-source.js";
import { Account } from "../entities/Account.js";

export const accountRepo = AppDataSource.getRepository(Account);
