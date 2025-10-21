import {
  useActionData,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import React from "react";
import type { AccountLoaderData } from "~/feature/account/account";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { ErrorBanner } from "~/shared/ui/ErrorBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { AccountForm } from "../ui/AccountForm";
import { AccountTable } from "../ui/AccountTable";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";

export function AccountPanelScreen() {
  const { accounts, editingAccount, flash } =
    useLoaderData<AccountLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");
  const isEditing = !!editingAccount;

  // Success flags (?created|updated|deleted|reactivated=1) → client-flash
  useUrlSuccessFlash("account");

  // Conflict flags (?conflict=...&message=...&elementId=...) → client-flash
  // Declare BEFORE useReactivateFlow so the effect that sets client-flash runs first

  useUrlConflictFlash("account", (p: URLSearchParams) => {
    const conflict = p.get("conflict"); // "create" | "update" | null

    if (conflict !== "create" && conflict !== "update") return null;
    const kind = conflict === "create" ? "create-conflict" : "update-conflict";
    const elementId = p.get("elementId");
    const code = (p.get("code") || "").toUpperCase();
    console.log(p.toString());
    const payload = {
      scope: "account",
      kind,
      message: p.get("message") ?? undefined,
      name: p.get("name") ?? undefined,
      description: p.get("description") ?? null,
      elementId: elementId != null ? Number(elementId) : undefined,
      reactivable: code === "ACCOUNT_EXISTS_INACTIVE",
    };
    const cleanupKeys = [
      "conflict",
      "message",
      "name",
      "description",
      "elementId",
      "code",
    ];

    console.log("[builder] payload=", payload);
    console.log("[builder] cleanupKeys=", cleanupKeys);
    return { payload, cleanupKeys };
  });

  // Reactivation prompt (consumes only conflicts with elementId)
  const { prompt, dismiss } = useReactivateFlow("account");

  // Success banner
  const { message, kind } = useCrudSuccess("account", {
    "created-success": "Cuenta creada con éxito.",
    "updated-success": "Cuenta modificada con éxito.",
    "deactivated-success": "Cuenta eliminada con éxito.",
    "reactivated-success": "Cuenta reactivada con éxito.",
  });

  const conflictActive = !!prompt;
  const overrideName = conflictActive
    ? prompt?.name ?? new URLSearchParams(location.search).get("name") ?? ""
    : undefined;

  // Client errors banner; include reactivable as fallback, we'll hide it if prompt is shown
  const { message: clientError } = useCrudError("account", {
    includeReactivable: true,
  });

  return (
    <div>
      <h1>Cuentas</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="cuenta"
        name={editingAccount?.name ?? null}
        cancelHref={`/account${include ? `?includeInactive=${include}` : ""}`}
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}
      {!prompt && clientError && <ErrorBanner message={clientError} />}

      {prompt && (
        <ReactivatePromptBanner
          overlay
          messageForUpdate={
            prompt.message ??
            `Se ha detectado una cuenta inactiva con este nombre.
            ¿Desea reactivarla? Si reactiva la antigua cuenta, la cuenta actual se desactivará.
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una cuenta inactiva con este nombre.
            ¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingAccount?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <AccountForm
        key={
          isEditing ? `update-${editingAccount.id}-account` : "create-account"
        }
        isEditing={isEditing}
        editing={editingAccount}
        formAction={`.${location.search}`}
        overrideName={overrideName}
      />

      <AccountTable
        accounts={accounts}
        editingId={editingAccount?.id ?? null}
      />
    </div>
  );
}

export function AccountPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de cuentas.";
  if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div>
      <h2 style={{ color: "red" }}>Error</h2>
      <p>{message}</p>
    </div>
  );
}
