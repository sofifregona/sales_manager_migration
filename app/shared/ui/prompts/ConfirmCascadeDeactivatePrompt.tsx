import React from "react";
import { useFetcher, useLocation } from "react-router-dom";
import { ActionPrompt } from "./ActionPrompt";

type Props = {
  entityId: number;
  count: number;
  entityLabel: string; // "cuenta"
  dependentLabel: string; // "método(s) de pago"
  strategyClear?: string; // e.g. "clear-products-category"
  strategyProceed: string; // e.g. "cascade-delete-payments"
  onCancel: () => void;
  proceedLabel?: string;
  clearLabel?: string;
};

export function ConfirmCascadeDeactivatePrompt({
  entityId,
  count,
  entityLabel,
  dependentLabel,
  strategyClear,
  strategyProceed,
  onCancel,
  proceedLabel,
  clearLabel,
}: Props) {
  const fetcher = useFetcher();
  const location = useLocation();
  const busy = fetcher.state !== "idle";

  const plural = count === 1 ? "" : "s";
  const message = `La ${entityLabel} está asociada a ${count} ${dependentLabel}${plural}.
Si continúa, también se eliminarán ${count === 1 ? `el ${dependentLabel}` : `los ${dependentLabel}`} asociados.`;

  const actions = [
    { label: "Cancelar", onClick: onCancel },
    strategyClear && {
      label: clearLabel ?? "Eliminar y limpiar vínculos",
      onClick: () =>
        fetcher.submit(
          { _action: "deactivate", id: String(entityId), strategy: strategyClear },
          { method: "post", action: `.${location.search}` }
        ),
    },
    {
      label: proceedLabel ?? "Aceptar",
      onClick: () =>
        fetcher.submit(
          { _action: "deactivate", id: String(entityId), strategy: strategyProceed },
          { method: "post", action: `.${location.search}` }
        ),
      variant: "secondary" as const,
    },
  ].filter(Boolean) as { label: string; onClick: () => void; variant?: "secondary" }[];

  return (
    <ActionPrompt open message={message} actions={actions} busy={busy} />
  );
}
