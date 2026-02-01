import type { DataSource } from "typeorm";
import { PaymentMethod } from "./payment-method.entity.js";
import { Account } from "../account/account.entity.js";
import { normalizeText } from "../../shared/utils/helpers/normalizeText.js";
import { ensureInitialAccount } from "../account/account.seed.js";

const INITIAL_PAYMENT_METHOD_NAME = "Efectivo";

export async function ensureInitialPaymentMethod(ds: DataSource) {
  const repo = ds.getRepository(PaymentMethod);
  const accountRepo = ds.getRepository(Account);
  let systemAccount = await accountRepo.findOne({
    where: { isSystem: true },
  });
  if (!systemAccount) {
    await ensureInitialAccount(ds);
    systemAccount = await accountRepo.findOne({ where: { isSystem: true } });
  }
  if (!systemAccount) throw new Error("No se pudo crear la cuenta de sistema");
  const normalizedName = normalizeText(INITIAL_PAYMENT_METHOD_NAME);
  const existing = await repo.findOne({ where: { account: systemAccount } });
  if (existing) return existing;

  const paymentMethod = repo.create({
    name: INITIAL_PAYMENT_METHOD_NAME,
    normalizedName,
    account: systemAccount,
    active: true,
  });

  return repo.save(paymentMethod);
}
