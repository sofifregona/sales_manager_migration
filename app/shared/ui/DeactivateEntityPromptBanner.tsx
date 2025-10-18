import React from "react";
import { useFetcher } from "react-router-dom";

type Props = {
  entityId: number;
  count: number;
  entityLabel: string; // "marca", "categoría", etc.
  onCancel: () => void;
  // Estrategias y labels para las acciones
  strategyClear: string; // p.ej. "clear-products-brand" | "clear-products-category"
  strategyDeactivate: string; // p.ej. "deactivate-products"
  optionClearLabel: string; // p.ej. "Quitar marca de los productos"
  optionDeactivateLabel: string; // p.ej. "Desactivar productos asociados"
};

export function DeactivateEntityPromptBanner({
  entityId,
  count,
  entityLabel,
  onCancel,
  strategyClear,
  strategyDeactivate,
  optionClearLabel,
  optionDeactivateLabel,
}: Props) {
  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";

  return (
    <div className="flash flash--warn" role="alert" style={{ marginTop: 8 }}>
      <div style={{ marginBottom: 8 }}>
        {`La ${entityLabel} está asociada a ${count} producto${count === 1 ? "" : "s"}. Elige una opción para continuar:`}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <fetcher.Form method="post" action= ".">
          <input type="hidden" name="_action" value="delete" />
          <input type="hidden" name="id" value={entityId} />
          <input type="hidden" name="strategy" value={strategyClear} />
          <button type="submit" className="btn btn--secondary" disabled={busy}>
            {optionClearLabel}
          </button>
        </fetcher.Form>
        <fetcher.Form method="post" action= ".">
          <input type="hidden" name="_action" value="delete" />
          <input type="hidden" name="id" value={entityId} />
          <input type="hidden" name="strategy" value={strategyDeactivate} />
          <button type="submit" className="btn btn--secondary" disabled={busy}>
            {optionDeactivateLabel}
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

