import React from "react";
import { ActionPrompt } from "~/shared/ui/prompts/ActionPrompt";

type Args = {
  conflict: any;
  inactiveId?: number;
  currentId?: number;
  busy: boolean;
  onDismiss: () => void;
  submit: (form: Record<string, string>) => void;
};

type OverlayConfig = {
  inUseCode: string;
  buildMessage: (count: number) => string;
  actions: Array<{
    label: string;
    strategy: string;
    variant?: "secondary" | "primary";
  }>;
};

export function makeRenderSwapOverlay(config: OverlayConfig) {
  const { inUseCode, buildMessage, actions } = config;
  return function render({
    conflict,
    inactiveId,
    currentId,
    busy,
    onDismiss,
    submit,
  }: Args): React.ReactNode | null {
    const code = String(conflict?.code || "").toUpperCase();
    if (
      code === inUseCode.toUpperCase() &&
      typeof currentId === "number" &&
      typeof inactiveId === "number"
    ) {
      const count = Number(conflict?.details?.count ?? 0);
      const message = buildMessage(count);

      const builtActions = actions.map((a) => ({
        label: a.label,
        variant: a.variant ?? "secondary",
        onClick: () =>
          submit({
            _action: "reactivate-swap",
            inactiveId: String(inactiveId),
            currentId: String(currentId),
            strategy: a.strategy,
          }),
      }));

      return (
        <ActionPrompt
          open
          message={message}
          actions={[{ label: "Cancelar", onClick: onDismiss }, ...builtActions]}
          busy={busy}
        />
      );
    }
    return null;
  };
}
