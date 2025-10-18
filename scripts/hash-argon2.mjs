import { hash } from "@node-rs/argon2";

const password = process.argv[2];
if (!password) {
  console.error("Uso: node scripts/hash-argon2.mjs <PASSWORD>");
  process.exit(1);
}

const hashed = await hash(password, {
  algorithm: 2, // 2 = argon2id
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 1,
});
console.log(hashed);
