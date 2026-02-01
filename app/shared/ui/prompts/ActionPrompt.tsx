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
  actions: Action[];
  busy?: boolean;
};

export function ActionPrompt({
  open,
  title,
  message,
  actions,
  busy = false,
}: Props) {
  if (!open) return null;
  return (
    <div className="action-prompt-overlay" role="dialog" aria-modal="true">
      <div className="action-prompt">
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div className="prompt-msg">{message}</div>
        <div className="prompt-div-btn">
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              className={a.variant === "secondary" ? "secondary-btn" : "btn"}
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
