import {
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import type { BrandLoaderData } from "~/feature/brand/brand";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { renderBrandSwapOverlay } from "~/feature/brand/conflict/renderBrandInUseOverlay";
import { BrandForm } from "../ui/BrandForm";
import { BrandTable } from "../ui/BrandTable";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { consumeConflictCookie } from "~/services/conflictCookie";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import "./BrandPanelScreen.sass";

export function BrandPanelScreen() {
  const { brands, editingBrand, flash } = useLoaderData<BrandLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const formError = actionData?.error;

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const include = searchParams.get("includeInactive");
  const includeInactive = include === "1";
  const editingIdParam = searchParams.get("id");
  const editingTargetId = editingIdParam ? Number(editingIdParam) : null;
  const cancelHref = `/settings/brand${
    include ? `?includeInactive=${include}` : ""
  }`;

  useUrlConflictFlash(
    "brand",
    makeReactivableConflictBuilder("brand", ["BRAND_EXISTS_INACTIVE"])
  );
  const { prompt, dismiss } = useReactivateFlow("brand");
  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Marca creada con éxito.",
      "updated-success": "Marca modificada con éxito.",
      "deactivated-success": "Marca eliminada con éxito.",
      "reactivated-success": "Marca reactivada con éxito.",
    },
  });

  const currentEditingBrand =
    editingTargetId != null && editingBrand?.id === editingTargetId
      ? editingBrand
      : null;
  const isEditing = !!currentEditingBrand;

  const conflictActive = !!prompt;
  const overrideName = useMemo(() => {
    if (!conflictActive) return undefined;
    const extras = consumeConflictCookie<{ name?: string }>() || {};
    return extras.name ?? "";
  }, [conflictActive]);
  // Client errors banner; include reactivable as fallback, we'll hide it if prompt is shown
  const { message: clientError } = useCrudError("brand", {
    includeReactivable: true,
  });

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

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

  return (
    <div className="settings-panel">
      <SettingsList actual="brand" />
      <section className="settings-panel__section settings-panel__brand">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de marcas
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear marca"}
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
            currentId={currentEditingBrand?.id ?? undefined}
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
                  {formMode === "edit" && currentEditingBrand ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingBrand.name} ]
                      </strong>
                    </>
                  ) : (
                    "Crear marca"
                  )}
                </h3>
              </div>
              <BrandForm
                key={
                  currentEditingBrand
                    ? `update-${currentEditingBrand.id}-brand`
                    : "create-brand"
                }
                isEditing={isEditing}
                editing={currentEditingBrand}
                formAction={`.${location.search}`}
                overrideName={overrideName}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <BrandTable brands={brands} editingId={editingTargetId} />
      </section>
    </div>
  );
}

export function BrandPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de marcas.";
  if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div className="panel-error">
      <h2 style={{ color: "red" }}>Error</h2>
      <p>{message}</p>
    </div>
  );
}
