import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
config();

import { Bartable } from "./entities/Bartable.js";
import { Brand } from "./entities/Brand.js";
import { Category } from "./entities/Category.js";
import { Employee } from "./entities/Employee.js";
import { Payment } from "./entities/Payment.js";
import { Product } from "./entities/Product.js";
import { ProductSold } from "./entities/ProductSold.js";
import { Sale } from "./entities/Sale.js";
import { Provider } from "./entities/Provider.js";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "3306", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Sacar en fase de producción
  dropSchema: false, // Sacar en fase de producción
  logging: false,
  entities: [
    Bartable,
    Brand,
    Category,
    Employee,
    Payment,
    Product,
    ProductSold,
    Sale,
    Provider,
  ],
  migrations: [],
  subscribers: [],
});
