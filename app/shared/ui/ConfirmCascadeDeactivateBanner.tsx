import React from "react";
import { useFetcher, useLocation } from "react-router-dom";

type Props = {
  entityId: number;
  count: number;
  entityLabel: string; // "cuenta"
  dependentLabel: string; // "método(s) de pago"
  strategyProceed: string; // e.g. "cascade-delete-payments"
  onCancel: () => void;
  proceedLabel?: string; // optional custom proceed label
};

export function ConfirmCascadeDeactivateBanner({
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
  const message = `La ${entityLabel} está asociada a ${count} ${dependentLabel}${plural}.\nSi continúa, también se eliminarán ${
    count === 1 ? `el ${dependentLabel}` : `los ${dependentLabel}`
  } asociados.`;

  return (
    <div className="flash flash--warn" role="alert" style={{ marginTop: 8 }}>
      <div style={{ marginBottom: 8, whiteSpace: "pre-line" }}>{message}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={busy}
        >
          Cancelar
        </button>
        <fetcher.Form method="post" action={`.${location.search}`}>
          <input type="hidden" name="_action" value="deactivate" />
          <input type="hidden" name="id" value={entityId} />
          <input type="hidden" name="strategy" value={strategyProceed} />
          <button type="submit" className="btn btn--secondary" disabled={busy}>
            {proceedLabel ?? "Aceptar"}
          </button>
        </fetcher.Form>
      </div>
      {fetcher.data && (fetcher.data as any).error && (
        <div className="inline-error" role="alert" style={{ marginTop: 8 }}>
          {String((fetcher.data as any).error)}
        </div>
      )}
    </div>
  );
}
