import {
  Link,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import type { CategoryLoaderData } from "~/feature/category/category";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { consumeConflictCookie } from "~/services/conflictCookie";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { CategoryForm } from "../ui/CategoryForm";
import { CategoryTable } from "../ui/CategoryTable";
import { renderCategorySwapOverlay } from "~/feature/category/conflict/renderCategoryInUseOverlay";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import "./CategoryPanelScreen.sass";

export function CategoryPanelScreen() {
  const { categories, editingCategory, flash } =
    useLoaderData<CategoryLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const formError = actionData?.error;
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const include = searchParams.get("includeInactive");
  const includeInactive = include === "1";
  const editingIdParam = searchParams.get("id");
  const editingTargetId = editingIdParam ? Number(editingIdParam) : null;
  const cancelHref = `/settings/category${
    include ? `?includeInactive=${include}` : ""
  }`;

  useUrlConflictFlash(
    "category",
    makeReactivableConflictBuilder("category", ["CATEGORY_EXISTS_INACTIVE"])
  );
  const { prompt, dismiss } = useReactivateFlow("category");
  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Categoría creada con éxito.",
      "updated-success": "Categoría modificada con éxito.",
      "deactivated-success": "Categoría eliminada con éxito.",
      "reactivated-success": "Categoría reactivada con éxito.",
    },
  });

  const overrideName = useMemo(() => {
    if (!prompt) return undefined;
    const extras = consumeConflictCookie<{ name?: string }>() || {};
    return extras.name ?? "";
  }, [prompt]);

  const currentEditingCategory =
    editingTargetId != null && editingCategory?.id === editingTargetId
      ? editingCategory
      : null;
  const isEditing = !!currentEditingCategory;
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const closedOnSuccessRef = useRef(false);

  useEffect(() => {
    if (editingTargetId != null) {
      setShowForm(true);
      setFormMode("edit");
    } else {
      setFormMode("create");
    }
  }, [editingTargetId]);

  useEffect(() => {
    if (formError) {
      setShowForm(true);
    }
  }, [formError]);

  useEffect(() => {
    if (showSuccess && !closedOnSuccessRef.current) {
      setShowForm(false);
      closedOnSuccessRef.current = true;
      if (location.search.includes("id=")) {
        navigate(cancelHref, { replace: true });
      }
    }
    if (!showSuccess) {
      closedOnSuccessRef.current = false;
    }
  }, [showSuccess, cancelHref, location.search, navigate]);

  const openCreate = () => {
    setFormMode("create");
    setShowForm(true);
    navigate(cancelHref, { replace: true });
  };

  const closeForm = () => {
    setShowForm(false);
    if (location.search.includes("id=")) {
      navigate(cancelHref, { replace: true });
    }
  };

  const { message: clientError } = useCrudError("category", {
    includeReactivable: true,
  });

  return (
    <div className="settings-panel">
      <SettingsList actual="category" />
      <section className="settings-panel__section settings-panel__category">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de categorías
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear categoría"}
            </button>
            {(() => {
              const p = new URLSearchParams(location.search);
              p.set("includeInactive", includeInactive ? "0" : "1");
              const toggleIncludeHref = `?${p.toString()}`;
              return (
                <Link
                  replace
                  to={toggleIncludeHref}
                  className={
                    includeInactive
                      ? "btn inactive-btn--active btn--icon-gap"
                      : "btn btn--icon-gap"
                  }
                >
                  {includeInactive ? (
                    <>
                      <FaEyeSlash className="action-icon" />
                      {" Ocultar inactivas"}
                    </>
                  ) : (
                    <>
                      <FaEye className="action-icon" />
                      {" Ver inactivas"}
                    </>
                  )}
                </Link>
              );
            })()}
          </div>
          {toastMessage && showSuccess && (
            <div className="toast-success-float" role="status">
              {toastMessage}
            </div>
          )}
        </div>

        <FlashMessages flash={{ error: flash?.error, source: flash?.source }} />
        {!prompt && clientError && <ErrorBanner message={clientError} />}

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
            currentId={currentEditingCategory?.id ?? undefined}
            onDismiss={dismiss}
          />
        )}

        {showForm && (
          <div
            className="action-prompt-overlay"
            role="dialog"
            aria-modal="true"
            onClick={closeForm}
          >
            <div
              className="action-prompt form-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="form-modal__header">
                <h3 className="settings-panel__subtitle">
                  {formMode === "edit" && currentEditingCategory ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingCategory.name} ]
                      </strong>
                    </>
                  ) : (
                    "Crear categoría"
                  )}
                </h3>
              </div>
              <CategoryForm
                key={
                  currentEditingCategory
                    ? `update-${currentEditingCategory.id}-category`
                    : "create-category"
                }
                isEditing={isEditing}
                editing={currentEditingCategory}
                formAction={`.${location.search}`}
                overrideName={overrideName}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <CategoryTable categories={categories} editingId={editingTargetId} />
      </section>
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
