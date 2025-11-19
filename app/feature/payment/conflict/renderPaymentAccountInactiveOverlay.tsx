import React from "react";
import { ActionPrompt } from "~/shared/ui/prompts/ActionPrompt";

export function renderPaymentAccountInactiveOverlay({
  conflict,
  isUpdate,
  inactiveId,
  currentId,
  busy,
  onDismiss,
  submit,
}: {
  conflict: any;
  isUpdate: boolean;
  inactiveId?: number;
  currentId?: number;
  busy: boolean;
  onDismiss: () => void;
  submit: (form: Record<string, string>) => void;
}): React.ReactNode | null {
  const code = String(conflict?.code || "").toUpperCase();
  if (!code || code !== "ACCOUNT_INACTIVE") return null;

  const message = isUpdate
    ? "El método de pago que intenta reactivar está asociado a una cuenta inactiva. Solo puede reactivarse si la cuenta también se reactiva.\n¿Desea reactivar ambos y desactivar el actual?"
    : "El método de pago que intenta reactivar está asociado a una cuenta inactiva. Solo puede reactivarse si la cuenta también se reactiva.\n¿Desea reactivar ambos?";

  const proceed = () => {
    if (
      isUpdate &&
      typeof inactiveId === "number" &&
      typeof currentId === "number"
    ) {
      submit({
        _action: "reactivate-swap",
        inactiveId: String(inactiveId),
        currentId: String(currentId),
        strategy: "reactivate-account",
      });
    } else if (typeof inactiveId === "number") {
      submit({
        _action: "reactivate",
        id: String(inactiveId),
        strategy: "reactivate-account",
      });
    }
  };

  return (
    <ActionPrompt
      open
      message={message}
      onClose={onDismiss}
      actions={[
        { label: "Cancelar", onClick: onDismiss },
        {
          label: "Reactivar cuenta y método",
          onClick: proceed,
          variant: "secondary" as const,
        },
      ]}
      busy={busy}
    />
  );
}
