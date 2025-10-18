import { setFlash } from "~/services/flashSession";
import type { ClientFlash, SuccessKind, ConflictKind } from "~/types/clientFlash";

export function setSuccessFlash(scope: string, kind: SuccessKind, message?: string) {
  const payload: ClientFlash = { scope, kind, ...(message ? { message } : {}) };
  setFlash(payload);
}

export function setConflictFlash(
  scope: string,
  data: {
    kind: ConflictKind;
    message?: string;
    name?: string;
    description?: string | null;
    accountId?: number;
  }
) {
  const payload: ClientFlash = { scope, ...data } as ClientFlash;
  setFlash(payload);
}

