import { useEffect, useState } from "react";
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
  const { consume } = useClientFlash(scope);

  useEffect(() => {
    const f = consume() as ConflictFlash | undefined;
    if (!f || f.scope !== scope) return;
    if (f.kind === "create-conflict" || f.kind === "update-conflict") {
      setPrompt({
        message: f.message,
        name: f.name,
        description: f.description,
        elementId: f.elementId,
      });
    }
  }, [scope, consume]);

  const dismiss = () => setPrompt(null);

  return { prompt, dismiss };
}
