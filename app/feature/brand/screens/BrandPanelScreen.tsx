import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import type { BrandLoaderData } from "~/feature/brand/brand";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { renderBrandSwapOverlay } from "~/feature/brand/conflict/renderBrandInUseOverlay";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { BrandForm } from "../ui/BrandForm";
import { BrandTable } from "../ui/BrandTable";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { consumeConflictCookie } from "~/services/conflictCookie";

export function BrandPanelScreen() {
  const { brands, editingBrand, flash } = useLoaderData<BrandLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");
  const isEditing = !!editingBrand;

  useUrlSuccessFlash("brand");
  useUrlConflictFlash(
    "brand",
    makeReactivableConflictBuilder("brand", ["BRAND_EXISTS_INACTIVE"])
  );
  const { prompt, dismiss } = useReactivateFlow("brand");
  const { message } = useCrudSuccess("brand", {
    "created-success": "Marca creada con éxito.",
    "updated-success": "Marca modificada con éxito.",
    "deactivated-success": "Marca eliminada con éxito.",
    "reactivated-success": "Marca reactivada con éxito.",
  });

  const conflictActive = !!prompt;
  const overrideName = (() => {
    if (!conflictActive) return undefined;
    const extras = consumeConflictCookie<{ name?: string }>() || {};
    return extras.name ?? "";
  })();

  // Client errors banner; include reactivable as fallback, we'll hide it if prompt is shown
  const { message: clientError } = useCrudError("brand", {
    includeReactivable: true,
  });

  return (
    <div>
      <h1>Marcas</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="marca"
        name={editingBrand?.name ?? null}
        cancelHref={`/brand${include ? `?includeInactive=${include}` : ""}`}
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
          renderConflictOverlay={renderBrandSwapOverlay}
          messageForUpdate={
            prompt.message ??
            `Se ha detectado una marca inactiva con este nombre. 
            ¿Desea reactivarla? Si reactiva la antigua marca, la marca actual se desactivará. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una marca inactiva con este nombre. 
            ¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingBrand?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <BrandForm
        key={isEditing ? `update-${editingBrand.id}-brand` : "create-brand"}
        isEditing={isEditing}
        editing={editingBrand}
        formAction={`.${location.search}`}
        overrideName={overrideName}
      />

      <BrandTable brands={brands} editingId={editingBrand?.id ?? null} />
    </div>
  );
}

export function BrandPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de marcas.";
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
