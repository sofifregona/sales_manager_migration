import { AppDataSource } from "@back/src/shared/database/data-source.js";
import { Employee } from "./employee.entity.js";

export const employeeRepo = AppDataSource.getRepository(Employee);
