import "reflect-metadata";
import { config as loadEnv } from "dotenv";
import argon2 from "argon2";
import { DataSource } from "typeorm";
import { User } from "../backend/src/modules/user/User.js";

loadEnv();

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const role = (process.env.ADMIN_ROLE?.toUpperCase() || "ADMIN") as
    | "ADMIN"
    | "MANAGER"
    | "CASHIER";
  const passwordHashEnv = process.env.ADMIN_PASSWORD_HASH?.trim();
  const plainPasswordEnv = process.env.ADMIN_PASSWORD?.trim();

  if (!username) {
    console.error("Falta ADMIN_USERNAME en .env");
    process.exit(1);
  }

  const passwordHash = passwordHashEnv
    ? passwordHashEnv
    : plainPasswordEnv
    ? await argon2.hash(plainPasswordEnv, { type: argon2.argon2id })
    : null;

  if (!passwordHash) {
    console.error(
      "Falta ADMIN_PASSWORD_HASH o ADMIN_PASSWORD en .env. Genera un hash primero."
    );
    process.exit(1);
  }

  // DataSource mínimo (solo entidad User) para evitar depender de metadatos
  const ds = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User],
  });

  await ds.initialize();
  const repo = ds.getRepository(User);

  const existing = await repo.findOne({ where: { username } });
  if (existing) {
    console.log("El usuario admin ya existe (", username, ")");
    await ds.destroy();
    process.exit(0);
  }

  const admin = repo.create({
    username,
    passwordHash,
    role,
    active: true,
  });

  await repo.save(admin);
  console.log("Usuario admin creado correctamente:", username);
  await ds.destroy();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
