import "reflect-metadata";
import { config as loadEnv } from "dotenv";
import argon2 from "argon2";
import { DataSource } from "typeorm";
import { User } from "../backend/src/modules/user/user.entity.js";
import { isRole, type Role } from "../backend/src/shared/constants/roles.js";

loadEnv();

async function main() {
  const usernameEnv = process.env.ADMIN_USERNAME?.trim() || "admin";
  const nameEnv = process.env.ADMIN_NAME?.trim() || "admin";
  const roleEnv = (process.env.ADMIN_ROLE || "ADMIN").toUpperCase();

  if (!isRole(roleEnv)) {
    throw new Error("ADMIN_ROLE inválido. Use ADMIN, MANAGER o CASHIER.");
  }
  const role = roleEnv as Role;

  const passwordHashEnv = process.env.ADMIN_PASSWORD_HASH?.trim();
  const plainPasswordEnv = process.env.ADMIN_PASSWORD?.trim();

  if (!usernameEnv) {
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

  // DataSource mÃ­nimo (solo entidad User) para evitar depender de metadatos
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

  const existing = await repo.findOne({ where: { username: usernameEnv } });
  if (existing) {
    console.log("El usuario admin ya existe (", usernameEnv, ")");
    await ds.destroy();
    process.exit(0);
  }

  const admin = repo.create({
    username: usernameEnv,
    name: nameEnv,
    passwordHash,
    role,
    active: true,
  });

  await repo.save(admin);
  console.log("Usuario admin creado correctamente:", usernameEnv);
  await ds.destroy();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
