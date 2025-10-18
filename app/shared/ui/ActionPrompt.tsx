import React from "react";

type Action = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  actions: Action[];
  busy?: boolean;
};

export function ActionPrompt({ open, title, message, onClose, actions, busy = false }: Props) {
  if (!open) return null;
  return (
    <div
      className="action-prompt-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="action-prompt"
        style={{
          background: "white",
          padding: 16,
          borderRadius: 6,
          boxShadow: "0 2px 14px rgba(0,0,0,0.2)",
          maxWidth: 480,
          width: "calc(100% - 32px)",
        }}
      >
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div style={{ marginBottom: 12, whiteSpace: "pre-line" }}>{message}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              className={a.variant === "secondary" ? "btn btn--secondary" : "btn"}
              onClick={a.onClick}
              disabled={busy || a.disabled}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

