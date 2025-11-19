import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { renderAccountSwapOverlay } from "~/feature/account/conflict/renderAccountInUseOverlay";
import type { AccountLoaderData } from "~/feature/account/account";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { AccountForm } from "../ui/AccountForm";
import { AccountTable } from "../ui/AccountTable";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { consumeConflictCookie } from "~/services/conflictCookie";
import SettingsScreen from "~/routes/settings";

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

  useUrlSuccessFlash("account");
  useUrlConflictFlash(
    "account",
    makeReactivableConflictBuilder("account", ["ACCOUNT_EXISTS_INACTIVE"])
  );

  const { prompt, dismiss } = useReactivateFlow("account");

  const { message } = useCrudSuccess("account", {
    "created-success": "Cuenta creada con éxito.",
    "updated-success": "Cuenta modificada con éxito.",
    "deactivated-success": "Cuenta eliminada con éxito.",
    "reactivated-success": "Cuenta reactivada con éxito.",
  });

  const conflictActive = !!prompt;
  const overrideName = (() => {
    if (!conflictActive) return undefined;
    const extras = consumeConflictCookie<{ name?: string }>() || {};
    return extras.name ?? "";
  })();

  const { message: clientError } = useCrudError("account", {
    includeReactivable: true,
  });

  return (
    <div>
      <SettingsScreen />
      <section className="settings__section">
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
            renderConflictOverlay={renderAccountSwapOverlay}
            messageForUpdate={
              prompt.message ??
              `Se ha detectado una cuenta inactiva con este nombre.
            ¿Desea reactivarla? Si reactiva la antigua cuenta, la cuenta actual se desactivará.
            Si desea cambiar el nombre, haga clic en cancelar.`
            }
            messageForCreate={
              prompt.message ??
              `Se ha detectado una cuenta inactiva con este nombre.
            �Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
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
      </section>
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
