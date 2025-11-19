import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import type { CategoryLoaderData } from "~/feature/category/category";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { consumeConflictCookie } from "~/services/conflictCookie";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { CategoryForm } from "../ui/CategoryForm";
import { CategoryTable } from "../ui/CategoryTable";
import { renderCategorySwapOverlay } from "~/feature/category/conflict/renderCategoryInUseOverlay";

export function CategoryPanelScreen() {
  const { categories, editingCategory, flash } =
    useLoaderData<CategoryLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const location = useLocation();
  const isEditing = !!editingCategory;

  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");

  // Convert URL success flags to client flash and clean the URL
  useUrlSuccessFlash("category");
  // Conflicts (URL minimal + extras via cookie)
  useUrlConflictFlash(
    "category",
    makeReactivableConflictBuilder("category", ["CATEGORY_EXISTS_INACTIVE"])
  );
  const { prompt, dismiss } = useReactivateFlow("category");
  const { message } = useCrudSuccess("category", {
    "created-success": "Categoría creada con éxito.",
    "updated-success": "Categoría modificada con éxito.",
    "deactivated-success": "Categoría eliminada con éxito.",
    "reactivated-success": "Categoría reactivada con éxito.",
  });

  return (
    <div>
      <h1>Categorías</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="categoría"
        name={editingCategory?.name ?? null}
        cancelHref={`/category${include ? `?includeInactive=${include}` : ""}`}
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      {prompt && (
        <ReactivatePromptBanner
          overlay
          renderConflictOverlay={renderCategorySwapOverlay}
          messageForUpdate={
            prompt.message ??
            `Se ha detectado una categoría inactiva con este nombre.
            ¿Desea reactivarla? Si reactiva la antigua categoría, la categoría actual se desactivará.
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una categoría inactiva con este nombre.
            ¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingCategory?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <CategoryForm
        isEditing={isEditing}
        editing={editingCategory}
        formAction={isEditing ? `.${location.search}` : "."}
        overrideName={(() => {
          if (!prompt) return undefined;
          const extras = consumeConflictCookie<{ name?: string }>() || {};
          return extras.name ?? "";
        })()}
      />

      <CategoryTable
        categories={categories}
        editingId={editingCategory?.id ?? null}
      />
    </div>
  );
}

export function CategoryPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de categorías.";
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
