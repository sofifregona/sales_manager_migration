import {
  Link,
  useActionData,
  useFetcher,
  useNavigation,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import type { AccountLoaderData } from "~/feature/account/account";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { AccountForm } from "../ui/AccountForm";
import { AccountTable } from "../ui/AccountTable";

export function AccountPanelScreen() {
  const { accounts, editingAccount, flash } =
    useLoaderData<AccountLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingAccount;
  const deleting = fetcher.state !== "idle";

  const { prompt, dismiss } = useReactivateFlow("account");
  const { message } = useCrudSuccess("account", {
    "created-success": "Cuenta creada con �xito.",
    "updated-success": "Cuenta modificada con �xito.",
    "deleted-success": "Cuenta eliminada con �xito.",
    "reactivated-success": "Cuenta reactivada con �xito.",
  });

  return (
    <div>
      <h1>Cuentas</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="cuenta"
        name={editingAccount?.name ?? null}
        cancelHref="/account"
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

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
        isEditing={isEditing}
        editing={editingAccount}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
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
