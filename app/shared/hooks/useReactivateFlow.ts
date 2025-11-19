import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useClientFlash } from "~/shared/hooks/useClientFlash";
import type { ConflictFlash } from "~/types/clientFlash";

export type ReactivatePrompt = {
  message?: string;
  name?: string;
  description?: string | null;
  elementId?: number;
};

export function useReactivateFlow(scope: string) {
  const [prompt, setPrompt] = useState<ReactivatePrompt | null>(null);
  const { read, consume } = useClientFlash(scope);
  const location = useLocation();

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (qs.get("reactivated") === "1") {
      setPrompt(null);
      return;
    }
    // Leer sin consumir primero; consumir sólo si es conflicto reactivable válido
    const f = read() as (ConflictFlash & { reactivable?: boolean }) | undefined;
    if (!f || (f as any).scope !== scope) return;
    if (f.kind === "create-conflict" || f.kind === "update-conflict") {
      const hasElement = typeof f.elementId === "number";
      const shouldPrompt = (f as any).reactivable === true && hasElement;
      if (shouldPrompt) {
        setPrompt({
          message: f.message,
          name: f.name,
          description: f.description,
          elementId: f.elementId,
        });
        // Consumimos ahora que confirmamos que es un conflicto válido
        consume();
      }
    }
  }, [scope, read, consume, location.key]);

  const dismiss = () => setPrompt(null);

  return { prompt, dismiss };
}
