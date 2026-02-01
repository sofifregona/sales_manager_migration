import {
  Link,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import type { ProviderLoaderData } from "~/feature/provider/provider";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import { ProviderForm } from "../ui/ProviderForm";
import { ProviderTable } from "../ui/ProviderTable";

import "./ProviderPanelScreen.sass";

export function ProviderPanelScreen() {
  const { providers, editingProvider, flash } =
    useLoaderData<ProviderLoaderData>();
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
  const cancelHref = `/settings/provider${
    include ? `?includeInactive=${include}` : ""
  }`;

  const currentEditingProvider =
    editingTargetId != null && editingProvider?.id === editingTargetId
      ? editingProvider
      : null;
  const isEditing = !!currentEditingProvider;
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Proveedor creado con éxito.",
      "updated-success": "Proveedor modificado con éxito.",
      "deactivated-success": "Proveedor eliminado con éxito.",
      "reactivated-success": "Proveedor reactivado con éxito.",
    },
  });

  const { message: clientError } = useCrudError("provider", {
    includeReactivable: true,
  });

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

  return (
    <div className="settings-panel">
      <SettingsList actual="provider" />
      <section className="settings-panel__section settings-panel__provider">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de proveedores
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear proveedor"}
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
                      {" Ocultar inactivos"}
                    </>
                  ) : (
                    <>
                      <FaEye className="action-icon" />
                      {" Ver inactivos"}
                    </>
                  )}
                </Link>
              );
            })()}
            {toastMessage && showSuccess && (
              <div className="toast-success-float" role="status">
                {toastMessage}
              </div>
            )}
          </div>
        </div>

        <FlashMessages flash={{ error: flash?.error, source: flash?.source }} />
        {clientError && <ErrorBanner message={clientError} />}

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
                  {formMode === "edit" && currentEditingProvider ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingProvider.name} ]
                      </strong>
                    </>
                  ) : (
                    "Crear proveedor"
                  )}
                </h3>
              </div>
              <ProviderForm
                key={
                  currentEditingProvider
                    ? `update-${currentEditingProvider.id}-provider`
                    : "create-provider"
                }
                isEditing={isEditing}
                editing={currentEditingProvider}
                formAction={`.${location.search}`}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <ProviderTable providers={providers} editingId={editingTargetId} />
      </section>
    </div>
  );
}

export function ProviderPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de proveedores.";
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
