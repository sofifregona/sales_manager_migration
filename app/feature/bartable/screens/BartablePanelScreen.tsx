import {
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import type { BartableLoaderData } from "~/feature/bartable/bartable";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { consumeConflictCookie } from "~/services/conflictCookie";
import { BartableForm } from "../ui/BartableForm";
import { BartableTable } from "../ui/BartableTable";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import "./BartablePanelScreen.sass";

export function BartablePanelScreen() {
  const { bartables, editingBartable, flash } =
    useLoaderData<BartableLoaderData>();
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
  const cancelHref = `/settings/bartable${
    includeInactive ? `?includeInactive=1` : ""
  }`;

  useUrlConflictFlash(
    "bartable",
    makeReactivableConflictBuilder("bartable", ["BARTABLE_EXISTS_INACTIVE"])
  );

  const { prompt, dismiss } = useReactivateFlow("bartable");
  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Mesa creada con éxito.",
      "updated-success": "Mesa modificada con éxito.",
      "deactivated-success": "Mesa eliminada con éxito.",
      "reactivated-success": "Mesa reactivada con éxito.",
    },
  });

  const currentEditingBartable =
    editingTargetId != null && editingBartable?.id === editingTargetId
      ? editingBartable
      : null;
  const isEditing = !!currentEditingBartable;

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const overrideNumber = useMemo(() => {
    if (!prompt) return undefined;
    const extras = consumeConflictCookie<{ number?: number }>() || {};
    return extras.number != null ? String(extras.number) : "";
  }, [prompt]);

  const { message: clientError } = useCrudError("bartable", {
    includeReactivable: true,
  });

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

  const closeForm = useCallback(() => {
    setShowForm(false);
    if (location.search.includes("id=")) {
      navigate(cancelHref, { replace: true });
    }
  }, [location.search, navigate, cancelHref]);

  useEffect(() => {
    if (showSuccess) {
      closeForm();
    }
  }, [showSuccess, closeForm]);

  const openCreate = () => {
    setFormMode("create");
    setShowForm(true);
    navigate(cancelHref, { replace: true });
  };

  return (
    <div className="settings-panel">
      <SettingsList actual="bartable" />
      <section className="settings-panel__section settings-panel__bartable">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de mesas
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear mesa"}
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
            messageForUpdate={`Se ha detectado una mesa inactiva con este número. 
              Si reactiva la antigua mesa, la mesa actual se desactivará.
            ¿Desea reactivarla?`}
            messageForCreate={`Se ha detectado una mesa inactiva con este número. 
            ¿Desea reactivarla?`}
            label="número"
            inactiveId={prompt.elementId}
            currentId={currentEditingBartable?.id ?? undefined}
            onDismiss={dismiss}
          />
        )}

        {showForm && !prompt && (
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
                  {formMode === "edit" && currentEditingBartable ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ Mesa {currentEditingBartable.number} ]
                      </strong>
                    </>
                  ) : (
                    "Crear mesa"
                  )}
                </h3>
              </div>
              <BartableForm
                key={
                  currentEditingBartable
                    ? `update-${currentEditingBartable.id}-bartable`
                    : "create-bartable"
                }
                isEditing={isEditing}
                editing={currentEditingBartable}
                formAction={`.${location.search}`}
                overrideNumber={overrideNumber}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <BartableTable bartables={bartables} editingId={editingTargetId} />
      </section>
    </div>
  );
}

export function BartablePanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de mesas.";
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
