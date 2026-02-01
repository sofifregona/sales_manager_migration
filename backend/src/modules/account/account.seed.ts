import type { DataSource } from "typeorm";
import { Account } from "./account.entity.js";
import { normalizeText } from "../../shared/utils/helpers/normalizeText.js";

const INITIAL_ACCOUNT_NAME = "Caja";

export async function ensureInitialAccount(ds: DataSource) {
  const repo = ds.getRepository(Account);
  const normalizedName = normalizeText(INITIAL_ACCOUNT_NAME);

  const existing = await repo.findOne({ where: { isSystem: true } });
  if (existing) return existing;

  const account = repo.create({
    name: INITIAL_ACCOUNT_NAME,
    normalizedName,
    description: "Cuenta inicial para aperturas y cierres de caja.",
    active: true,
    isSystem: true,
  });

  return repo.save(account);
}
