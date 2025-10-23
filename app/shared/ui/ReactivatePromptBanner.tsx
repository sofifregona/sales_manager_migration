import React from "react";
import { useFetcher, useLocation } from "react-router-dom";
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
  console.log("DENTRO DEL PROMPT");
  console.log(inactiveId);
  console.log(currentId);
  console.log(overlay);
  const fetcher = useFetcher();
  const canReactivate = typeof inactiveId === "number";
  const isUpdate = kind === "update-conflict" && typeof currentId === "number";
  console.log(isUpdate);
  const msg = isUpdate ? messageForUpdate : messageForCreate;
  const busy = fetcher.state !== "idle";
  const location = useLocation();

  if (overlay) {
    const conflict = fetcher.data as any;
    if (conflict && conflict.code === "ACCOUNT_INACTIVE" && canReactivate) {
      const proceed = () =>
        fetcher.submit(
          {
            _action: isUpdate ? "reactivate-swap" : "reactivate",
            inactiveId: String(inactiveId ?? ""),
            currentId: String(currentId ?? ""),
            id: String(inactiveId ?? ""),
            strategy: "reactivate-account",
          },
          { method: isUpdate ? "post" : "post", action: `.${location.search}` }
        );
      return (
        <ActionPrompt
          open
          message={
            "El método de pago que intenta reactivar está asociado a una cuenta inactiva. Solo puede reactivarse si la cuenta también se reactiva.\n¿Desea reactivar ambos?"
          }
          onClose={onDismiss}
          actions={[
            { label: "Cancelar", onClick: onDismiss },
            {
              label: isUpdate
                ? "Reactivar cuenta y método (swap)"
                : "Reactivar cuenta y método",
              onClick: proceed,
              variant: "secondary" as const,
            },
          ]}
          busy={busy}
        />
      );
    }
    if (conflict && conflict.code === "ACCOUNT_IN_USE" && isUpdate && typeof currentId === "number" && typeof inactiveId === "number") {
      const cnt = Number((conflict as any).details?.count ?? 0);
      const m = `La cuenta actual tiene ${cnt} método${cnt === 1 ? '' : 's'} de pago asociados.\nSi continúa, también se desactivarán los métodos de pago asociados.`;
      const proceed = () =>
        fetcher.submit(
          { _action: "reactivate-swap", inactiveId: String(inactiveId), currentId: String(currentId), strategy: "cascade-delete-payments" },
          { method: "post", action: `.${location.search}` }
        );
      return (
        <ActionPrompt
          open
          message={m}
          onClose={onDismiss}
          actions={[
            { label: "Cancelar", onClick: onDismiss },
            { label: "Continuar y desactivar pagos", onClick: proceed, variant: "secondary" as const },
          ]}
          busy={busy}
        />
      );
    }    const actions = [
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
                    { method: "post", action: `.${location.search}` }
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
                    { method: "post", action: `.${location.search}` }
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

    console.log("ACCIONES");
    console.log(actions);

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
            <fetcher.Form method="post" action={`.${location.search}`}>
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
            <fetcher.Form method="post" action={`.${location.search}`}>
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
