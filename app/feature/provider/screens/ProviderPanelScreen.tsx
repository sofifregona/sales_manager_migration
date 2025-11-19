import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import type { ProviderLoaderData } from "~/feature/provider/provider";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { ProviderForm } from "../ui/ProviderForm";
import { ProviderTable } from "../ui/ProviderTable";

export function ProviderPanelScreen() {
  const { providers, editingProvider, flash } =
    useLoaderData<ProviderLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");

  const isEditing = !!editingProvider;

  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("provider");
  const { message } = useCrudSuccess("provider", {
    "created-success": "Proveedor creado con éxito.",
    "updated-success": "Proveedor modificado con éxito.",
    "deactivated-success": "Proveedor eliminado con éxito.",
    "reactivated-success": "Proveedor reactivado con éxito.",
  });

  return (
    <div>
      <h1>Proveedor</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="proveedor"
        name={editingProvider?.name ?? null}
        cancelHref={`/provider${include ? `?includeInactive=${include}` : ""}`}
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      <ProviderForm
        isEditing={isEditing}
        editing={editingProvider}
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
  let message = "Ocurrió un error al cargar la lista de proveedores.";
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
