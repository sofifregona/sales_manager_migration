import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
config();

import { Bartable } from "@back/src/modules/bartable/bartable.entity.js";
import { Brand } from "@back/src/modules/brand/brand.entity.js";
import { Category } from "@back/src/modules/category/category.entity.js";
import { Employee } from "@back/src/modules/employee/employee.entity.js";
import { Payment } from "@back/src/modules/payment/payment.entity.js";
import { Product } from "@back/src/modules/product/product.entity.js";
import { ProductSold } from "@back/src/modules/sale/product-sold.entity.js";
import { Sale } from "@back/src/modules/sale/sale.entity.js";
import { Provider } from "@back/src/modules/provider/provider.entity.js";
import { Account } from "@back/src/modules/account/account.entity.js";
import { Transaction } from "@back/src/modules/transaction/transaction.entity.js";
import { User } from "@back/src/modules/user/user.entity.js";

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
    Account,
    Bartable,
    Brand,
    Category,
    Employee,
    Payment,
    Product,
    ProductSold,
    Provider,
    Sale,
    Transaction,
    User,
  ],
  migrations: [],
  subscribers: [],
});
