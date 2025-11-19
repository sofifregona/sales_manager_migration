import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import type { BartableLoaderData } from "~/feature/bartable/bartable";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { BartableForm } from "../ui/BartableForm";
import { BartableTable } from "../ui/BartableTable";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { consumeConflictCookie } from "~/services/conflictCookie";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";

export function BartablePanelScreen() {
  const { bartables, editingBartable, flash } =
    useLoaderData<BartableLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");
  const isEditing = !!editingBartable;

  useUrlSuccessFlash("bartable");
  useUrlConflictFlash(
    "bartable",
    makeReactivableConflictBuilder("bartable", ["BARTABLE_EXISTS_INACTIVE"])
  );

  const { prompt, dismiss } = useReactivateFlow("bartable");

  const { message, kind } = useCrudSuccess("bartable", {
    "created-success": "Mesa creada con éxito.",
    "updated-success": "Mesa modificada con éxito.",
    "deactivated-success": "Mesa eliminada con éxito.",
    "reactivated-success": "Mesa reactivada con éxito.",
  });

  const conflictActive = !!prompt;
  const overrideNumber = (() => {
    if (!conflictActive) return undefined;
    const extras = consumeConflictCookie<{ number?: number }>() || {};
    return extras.number != null ? String(extras.number) : "";
  })();

  // Client errors banner; include reactivable as fallback, we'll hide it if prompt is shown
  const { message: clientError } = useCrudError("bartable", {
    includeReactivable: true,
  });

  return (
    <div>
      <h1>Mesas</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="mesa"
        name={editingBartable?.number.toString() ?? null}
        cancelHref={`/bartable${include ? `?includeInactive=${include}` : ""}`}
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
            `Se ha detectado una mesa inactiva con este número. 
            ¿Desea reactivarla? Si reactiva la antigua mesa, la mesa actual se desactivará. 
            Si desea cambiar el nÃºmero, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una mesa inactiva con este número. 
            ¿Desea reactivarla? Si desea cambiar el número, haga clic en cancelar.`
          }
          label="número"
          inactiveId={prompt.elementId}
          currentId={editingBartable?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <BartableForm
        key={
          isEditing
            ? `update-${editingBartable.id}-bartable`
            : "create-bartable"
        }
        isEditing={isEditing}
        editing={editingBartable}
        formAction={`.${location.search}`}
        overrideNumber={overrideNumber}
      />

      <BartableTable
        bartables={bartables}
        editingId={editingBartable?.id ?? null}
      />
    </div>
  );
}

export function BartablePanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de mesas.";
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
