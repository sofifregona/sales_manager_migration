import React from "react";
import { ActionPrompt } from "./ActionPrompt";

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  open?: boolean; // defaults to true for backward compat
};

export function ConfirmPrompt({
  message,
  onConfirm,
  onCancel,
  busy = false,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  open = true,
}: Props) {
  return (
    <ActionPrompt
      open={open}
      message={message}
      onClose={onCancel}
      busy={busy}
      actions={[
        { label: cancelLabel, onClick: onCancel },
        { label: confirmLabel, onClick: onConfirm, variant: "secondary" },
      ]}
    />
  );
}
