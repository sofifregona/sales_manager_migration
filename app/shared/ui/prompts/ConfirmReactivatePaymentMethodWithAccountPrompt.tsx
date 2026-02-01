import React from "react";
import { ActionPrompt } from "./ActionPrompt";

type Props = {
  paymentMethodId: number;
  accountName?: string;
  error?: string;
  onCancel: () => void;
  onProceed: () => void;
  busy?: boolean;
};

export function ConfirmReactivatePaymentMethodWithAccountPrompt({
  paymentMethodId,
  accountName,
  error,
  onCancel,
  onProceed,
  busy = false,
}: Props) {
  const message =
    "El método de pago que intenta reactivar está asociado a una cuenta inactiva. Solo puede reactivarse si la cuenta también se reactiva.\n¿Desea reactivar ambos?";

  const actions = [
    { label: "Cancelar", onClick: onCancel },
    {
      label: "Reactivar cuenta y método",
      onClick: onProceed,
      variant: "secondary" as const,
    },
  ];

  return (
    <ActionPrompt
      open
      message={
        accountName
          ? `${message}\n\nCuenta asociada: ${accountName}${
              error ? `\n\n${error}` : ""
            }`
          : error
          ? `${message}\n\n${error}`
          : message
      }
      actions={actions}
      busy={busy}
    />
  );
}
