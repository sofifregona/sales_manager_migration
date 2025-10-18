import React from "react";
import { useFetcher } from "react-router-dom";
import { ActionPrompt } from "./ActionPrompt";

type Props = {
  messageForCreate?: string;
  messageForUpdate?: string;
  label?: string; // deprecated: prefer cancelText
  cancelText?: string;
  inactiveId?: number; // id de la cuenta inactiva
  currentId?: number; // id de la cuenta actual (para swap en update)
  kind?: "create-conflict" | "update-conflict";
  onDismiss: () => void;
  overlay?: boolean;
};

export function ReactivatePromptBanner({
  messageForUpdate,
  messageForCreate,
  inactiveId,
  currentId,
  label,
  kind,
  onDismiss,
  overlay = false,
}: Props) {
  const fetcher = useFetcher();
  const canReactivate = typeof inactiveId === "number";
  const isUpdate = kind === "update-conflict" && typeof currentId === "number";
  const msg = isUpdate ? messageForUpdate : messageForCreate;
  const busy = fetcher.state !== "idle";

  if (overlay) {
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
                      _action: "reactivateSwap",
                      inactiveId: String(inactiveId),
                      currentId: String(currentId ?? ""),
                    },
                    { method: "post", action: "." }
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
                    { method: "post", action: "." }
                  ),
                variant: "secondary" as const,
              },
            ]
        : [
            { label: "Reactivar", onClick: () => {}, variant: "secondary" as const, disabled: true },
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
            <fetcher.Form method="post" action=".">
              <input type="hidden" name="_action" value="reactivateSwap" />
              <input type="hidden" name="inactiveId" value={inactiveId} />
              <input type="hidden" name="currentId" value={currentId ?? ""} />
              <button type="submit" className="btn btn--secondary" disabled={busy}>
                Reactivar y desactivar actual
              </button>
            </fetcher.Form>
          ) : (
            <fetcher.Form method="post" action=".">
              <input type="hidden" name="_action" value="reactivate" />
              <input type="hidden" name="id" value={inactiveId} />
              <button type="submit" className="btn btn--secondary" disabled={busy}>
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
