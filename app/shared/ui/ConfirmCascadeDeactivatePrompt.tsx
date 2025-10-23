import React from "react";
import { useFetcher, useLocation } from "react-router-dom";
import { ActionPrompt } from "./ActionPrompt";

type Props = {
  entityId: number;
  count: number;
  entityLabel: string; // "cuenta"
  dependentLabel: string; // "método(s) de pago"
  strategyProceed: string; // e.g. "cascade-delete-payments"
  onCancel: () => void;
  proceedLabel?: string;
};

export function ConfirmCascadeDeactivatePrompt({
  entityId,
  count,
  entityLabel,
  dependentLabel,
  strategyProceed,
  onCancel,
  proceedLabel,
}: Props) {
  const fetcher = useFetcher();
  const location = useLocation();
  const busy = fetcher.state !== "idle";

  const plural = count === 1 ? "" : "s";
  const message = `La ${entityLabel} está asociada a ${count} ${dependentLabel}${plural}.
Si continúa, también se eliminarán ${count === 1 ? `el ${dependentLabel}` : `los ${dependentLabel}`} asociados.`;

  const actions = [
    { label: "Cancelar", onClick: onCancel },
    {
      label: proceedLabel ?? "Aceptar",
      onClick: () =>
        fetcher.submit(
          { _action: "deactivate", id: String(entityId), strategy: strategyProceed },
          { method: "post", action: `.${location.search}` }
        ),
      variant: "secondary" as const,
    },
  ];

  return (
    <ActionPrompt open message={message} onClose={onCancel} actions={actions} busy={busy} />
  );
}

