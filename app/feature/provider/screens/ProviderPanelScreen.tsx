import {
  Link,
  useActionData,
  useFetcher,
  useNavigation,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import type { ProviderLoaderData } from "~/feature/provider/provider";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { ProviderForm } from "../ui/ProviderForm";
import { ProviderTable } from "../ui/ProviderTable";

useUrlSuccessFlash("provider");

export function ProviderPanelScreen() {
  const { providers, editingProvider, flash } =
    useLoaderData<ProviderLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingProvider;
  const deleting = fetcher.state !== "idle";

  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("provider");
  const { prompt, dismiss } = useReactivateFlow("provider");
  const { message } = useCrudSuccess("provider", {
    "created-success": "Proveedor creado con éxito.",
    "updated-success": "Proveedor modificado con éxito.",
    "deleted-success": "Proveedor eliminado con éxito.",
    "reactivated-success": "Proveedor reactivado con éxito.",
  });

  return (
    <div>
      <h1>Proveedor</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="proveedor"
        name={editingProvider?.name ?? null}
        cancelHref="/provider"
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      {prompt && (
        <ReactivatePromptBanner
          messageForUpdate={
            prompt.message ??
            `Se ha detectado una cuenta inactiva con este nombre. 
            Â¿Desea reactivarla? Si reactiva la antigua cuenta, la cuenta actual se desactivarÃ¡. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una cuenta inactiva con este nombre. 
            Â¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingProvider?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <ProviderForm
        isEditing={isEditing}
        editing={editingProvider}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <ProviderTable
        providers={providers}
        editingId={editingProvider?.id ?? null}
      />
    </div>
  );
}

export function ProviderPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "OcurriÃ³ un error al cargar la lista de cuentas.";
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
