import { useCallback } from "react";
import {
  readFlash as _read,
  consumeFlash as _consume,
  clearFlash as _clear,
  setFlash as _set,
} from "~/services/flashSession";
import type { ClientFlash } from "~/types/clientFlash";

export function useClientFlash(scope?: string) {
  const read = useCallback((): ClientFlash | undefined => {
    const v = _read() as ClientFlash | undefined;
    if (!v) return undefined;
    if (scope && (v as any).scope !== scope) return undefined;
    return v;
  }, [scope]);

  const consume = useCallback((): ClientFlash | undefined => {
    const v = _consume() as ClientFlash | undefined;
    if (!v) return undefined;
    if (scope && (v as any).scope !== scope) return undefined;
    return v;
  }, [scope]);

  const clear = useCallback(() => {
    _clear();
  }, []);

  const set = useCallback((value: ClientFlash) => {
    _set(value as any);
  }, []);

  return { read, consume, clear, set };
}

