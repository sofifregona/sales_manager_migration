import React from "react";

type Props = {
  message: string;
  variant?: "error" | "warn";
};

export function ErrorBanner({ message, variant = "error" }: Props) {
  if (!message) return null;
  return (
    <p className={`flash ${variant === "warn" ? "flash--warn" : "flash--error"}`}>
      {message}
    </p>
  );
}

