import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useClientFlash } from "~/shared/hooks/useClientFlash";
import type { ConflictFlash } from "~/types/clientFlash";

export type ReactivatePrompt = {
  elementId?: number;
  message?: string;
};

export function useReactivateFlow(scope: string) {
  const [prompt, setPrompt] = useState<ReactivatePrompt | null>(null);
  const { read, consume } = useClientFlash(scope);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reactivated") === "1") {
      setPrompt(null);
      return;
    }
    // Leer sin consumir primero; consumir sólo si es conflicto reactivable válido
    const flash = read() as
      | (ConflictFlash & { reactivable?: boolean })
      | undefined;
    if (!flash || (flash as any).scope !== scope) return;
    if (flash.kind === "create-conflict" || flash.kind === "update-conflict") {
      const hasElement = typeof flash.elementId === "number";
      const shouldPrompt = (flash as any).reactivable === true && hasElement;
      if (shouldPrompt) {
        setPrompt({
          elementId: flash.elementId,
        });
        // Consumimos ahora que confirmamos que es un conflicto válido
        consume();
      }
    }
  }, [scope, read, consume, location.key]);

  const dismiss = () => setPrompt(null);

  return { prompt, dismiss };
}
