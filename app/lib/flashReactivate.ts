import type { ConflictFlash } from "~/types/clientFlash";

export type ReactivatePrompt = {
  message?: string;
  name?: string;
  description?: string | null;
  elementId?: number;
};

export function consumeReactivatePrompt(
  flash: Partial<ConflictFlash> | undefined
): ReactivatePrompt | null {
  if (!flash || !flash.kind) return null;
  if (flash.kind !== "create-conflict" && flash.kind !== "update-conflict") {
    return null;
  }
  return {
    message: flash.message,
    name: flash.name,
    description: flash.description,
    elementId: flash.elementId,
  };
}
