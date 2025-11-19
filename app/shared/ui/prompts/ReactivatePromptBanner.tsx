import React from "react";
import { useFetcher, useLocation } from "react-router-dom";
import { ActionPrompt } from "./ActionPrompt";

type Props = {
  messageForCreate?: string;
  messageForUpdate?: string;
  label?: string; // deprecated: prefer cancelText
  cancelText?: string;
  inactiveId?: number; // id del elemento inactivo
  currentId?: number; // id del elemento actual (para swap en update)
  kind?: "create-conflict" | "update-conflict";
  onDismiss: () => void;
  overlay?: boolean;
  // Optional: allow the caller to render a custom conflict overlay using the same fetcher
  renderConflictOverlay?: (args: {
    conflict: any;
    isUpdate: boolean;
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
  kind,
  onDismiss,
  overlay = false,
  renderConflictOverlay,
}: Props) {
  const fetcher = useFetcher();
  const canReactivate = typeof inactiveId === "number";
  const isUpdate = kind === "update-conflict" && typeof currentId === "number";
  const msg = isUpdate ? messageForUpdate : messageForCreate;
  const busy = fetcher.state !== "idle";
  const location = useLocation();

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
        isUpdate,
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
      ...(canReactivate
        ? isUpdate
          ? [
              {
                label: "Reactivar y desactivar actual",
                onClick: () =>
                  fetcher.submit(
                    {
                      _action: "reactivate-swap",
                      inactiveId: String(inactiveId),
                      currentId: String(currentId ?? ""),
                    },
                    { method: "post", action: cleanedActionUrl }
                  ),
                variant: "secondary" as const,
              },
            ]
          : [
              {
                label: "Reactivar",
                onClick: () =>
                  fetcher.submit(
                    { _action: "reactivate", id: String(inactiveId) },
                    { method: "post", action: cleanedActionUrl }
                  ),
                variant: "secondary" as const,
              },
            ]
        : [
            {
              label: "Reactivar",
              onClick: () => {},
              variant: "secondary" as const,
              disabled: true,
            },
          ]),
    ];

    return (
      <ActionPrompt
        open
        message={msg ?? ""}
        onClose={onDismiss}
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
          isUpdate ? (
            <fetcher.Form method="post" action={cleanedActionUrl}>
              <input type="hidden" name="_action" value="reactivate-swap" />
              <input type="hidden" name="inactiveId" value={inactiveId} />
              <input type="hidden" name="currentId" value={currentId ?? ""} />
              <button
                type="submit"
                className="btn btn--secondary"
                disabled={busy}
              >
                Reactivar y desactivar actual
              </button>
            </fetcher.Form>
          ) : (
            <fetcher.Form method="post" action={cleanedActionUrl}>
              <input type="hidden" name="_action" value="reactivate" />
              <input type="hidden" name="id" value={inactiveId} />
              <button
                type="submit"
                className="btn btn--secondary"
                disabled={busy}
              >
                Reactivar
              </button>
            </fetcher.Form>
          )
        ) : (
          <button type="button" className="btn btn--secondary" disabled>
            Reactivar
          </button>
        )}
      </div>
    </div>
  );
}
