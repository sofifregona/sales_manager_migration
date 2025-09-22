import { AppDataSource } from "../data-source.js";
import { Employee } from "../entities/Employee.js";
export const employeeRepo = AppDataSource.getRepository(Employee);
