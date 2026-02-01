import React from "react";
import { useFetcher } from "react-router-dom";
import { ActionPrompt } from "./ActionPrompt";

type Props = {
  messageForCreate?: string;
  messageForUpdate?: string;
  label?: string; // deprecated: prefer cancelText
  cancelText?: string;
  inactiveId?: number; // id del elemento inactivo
  currentId?: number; // id del elemento actual (para swap en update)
  onDismiss: () => void;
  overlay?: boolean;
  // Optional: allow the caller to render a custom conflict overlay using the same fetcher
  renderConflictOverlay?: (args: {
    conflict: any;
    inactiveId?: number;
    currentId?: number;
    busy: boolean;
    onDismiss: () => void;
    submit: (form: Record<string, string>) => void;
  }) => React.ReactNode | null;
};

export function ReactivatePromptBanner({
  messageForUpdate,
  messageForCreate,
  inactiveId,
  currentId,
  onDismiss,
  overlay = false,
  renderConflictOverlay,
}: Props) {
  const fetcher = useFetcher();
  const canReactivate = typeof inactiveId === "number";
  const isUpdate = typeof currentId === "number";
  const msg = isUpdate ? messageForUpdate : messageForCreate;
  const busy = fetcher.state !== "idle";

  // Construir action absoluto preservando filtros y limpiando claves efímeras
  // Para acciones de React Router, apuntar al action de la ruta actual es suficiente.
  // Los filtros permanecen en la URL de la página; el action no necesita la query.
  const cleanedActionUrl = ".";

  if (overlay) {
    const conflict = fetcher.data as any;

    // Allow entity-specific overlay rendering
    if (renderConflictOverlay) {
      const node = renderConflictOverlay({
        conflict,
        inactiveId,
        currentId,
        busy,
        onDismiss,
        submit: (form) =>
          fetcher.submit(form as any, { method: "post", action: cleanedActionUrl }),
      });
      if (node) return node;
    }

    // Default overlay behaviour
    const actions = [
      { label: "Cancelar", onClick: onDismiss },
      {
        label: "Reactivar",
        onClick: () => {
          if (!canReactivate) return;
          const form = isUpdate
            ? {
                _action: "reactivate-swap",
                inactiveId: String(inactiveId),
                currentId: String(currentId ?? ""),
              }
            : { _action: "reactivate", id: String(inactiveId) };
          fetcher.submit(form as any, {
            method: "post",
            action: cleanedActionUrl,
          });
        },
        variant: "secondary" as const,
        disabled: !canReactivate,
      },
    ];

    return (
      <ActionPrompt
        open
        message={msg ?? ""}
        actions={actions}
        busy={busy}
      />
    );
  }

  // Inline banner (non-overlay)
  return (
    <div
      className="flash flash--warn"
      role="alert"
      style={{ marginBottom: 12 }}
    >
      <div style={{ marginBottom: 8 }}>{msg}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={onDismiss}>
          Cancelar
        </button>
        {canReactivate ? (
          <fetcher.Form method="post" action={cleanedActionUrl}>
            {isUpdate ? (
              <>
                <input type="hidden" name="_action" value="reactivate-swap" />
                <input type="hidden" name="inactiveId" value={inactiveId} />
                <input type="hidden" name="currentId" value={currentId ?? ""} />
              </>
            ) : (
              <>
                <input type="hidden" name="_action" value="reactivate" />
                <input type="hidden" name="id" value={inactiveId} />
              </>
            )}
            <button
              type="submit"
              className="btn btn--secondary"
              disabled={busy}
            >
              Reactivar
            </button>
          </fetcher.Form>
        ) : (
          <button type="button" className="btn btn--secondary" disabled>
            Reactivar
          </button>
        )}
      </div>
    </div>
  );
}
