import { AppDataSource } from "../data-source.js";
import { Provider } from "../entities/Provider.js";
export const providerRepo = AppDataSource.getRepository(Provider);
