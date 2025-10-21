import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useClientFlash } from "~/shared/hooks/useClientFlash";
import type { ClientFlash } from "~/types/clientFlash";

type Result = { message: string | null; kind: string | null; isError: boolean };

// Consumes client-flash only for non-reactivation conflicts (no elementId) or generic client errors
export function useCrudError(scope: string, opts?: { includeReactivable?: boolean }): Result {
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  const { read, clear } = useClientFlash(scope);
  const location = useLocation();

  useEffect(() => {
    const f = read() as (ClientFlash & { elementId?: number }) | undefined;
    if (!f || (f as any).scope !== scope) {
      // keep current error visible until new flash arrives
      return;
    }

    const isSuccess = /-success$/.test((f as any).kind || "");
    const isConflict = (f as any).kind === "create-conflict" || (f as any).kind === "update-conflict";
    const hasElement = typeof (f as any).elementId === "number";

    // Ignore successes and reactivation conflicts (unless explicitly included)
    if (isSuccess || (!opts?.includeReactivable && isConflict && hasElement)) {
      setKind(null);
      setMessage(null);
      return;
    }

    const msg = (f as any).message as string | undefined;
    setKind((f as any).kind as string);
    setMessage(msg ?? null);
    clear();
  }, [scope, read, clear, location.key, opts?.includeReactivable]);

  return { message, kind, isError: !!kind };
}
