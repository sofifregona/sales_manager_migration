import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Provider } from "./provider.entity.js";

export const providerRepo = AppDataSource.getRepository(Provider);
