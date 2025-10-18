import type { Flash } from "~/types/flash";

type SuccessFlag = "created" | "updated" | "deleted" | "incremented";

interface FlashMessagesProps {
  flash?: (Flash & Partial<Record<SuccessFlag, boolean>>) | null;
  successMessages?: Partial<Record<SuccessFlag, string>>;
  actionError?: {
    error?: string;
    message?: string;
    source?: "client" | "server";
  } | null;
}

export function FlashMessages({
  flash,
  successMessages = {},
  actionError,
}: FlashMessagesProps) {
  const successEntries = Object.entries(successMessages) as [
    SuccessFlag,
    string,
  ][];

  const actionMessage = actionError?.message ?? actionError?.error;

  if (!flash && !actionMessage) {
    return null;
  }

  return (
    <>
      {flash &&
        successEntries
          .filter(([flag]) => Boolean(flash?.[flag]))
          .map(([flag, message]) => (
            <p key={flag} className="flash flash--success">
              {message}
            </p>
          ))}

      {flash?.success && (
        <p className="flash flash--success">{flash.success}</p>
      )}

      {flash?.error && (
        <p
          className={`flash ${
            flash.source === "client" ? "flash--warn" : "flash--error"
          }`}
        >
          {flash.error}
        </p>
      )}

      {actionMessage && (
        <p
          className={`flash ${
            actionError?.source === "client" ? "flash--warn" : "flash--error"
          }`}
        >
          {actionMessage}
        </p>
      )}
    </>
  );
}
