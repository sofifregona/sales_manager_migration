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
import type { UserLoaderData } from "~/feature/user/user";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import { UserForm } from "../ui/UserForm";
import { UserTable } from "../ui/UserTable";

import "./UserPanelScreen.sass";

export function UserPanelScreen() {
  const { users, editingUser, flash } = useLoaderData<UserLoaderData>();
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
  const resetPwd = searchParams.get("reset-password") === "1";
  const cancelHref = `/settings/user${
    include ? `?includeInactive=${include}` : ""
  }`;

  const currentEditingUser =
    editingTargetId != null && editingUser?.id === editingTargetId
      ? editingUser
      : null;
  const action: "create" | "update" | "reset-password" = resetPwd
    ? "reset-password"
    : currentEditingUser
    ? "update"
    : "create";
  const isEditing = !!currentEditingUser;
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const closedOnSuccessRef = useRef(false);

  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Usuario creado con éxito.",
      "updated-success": "Usuario modificado con éxito.",
      "deactivated-success": "Usuario eliminado con éxito.",
      "reactivated-success": "Usuario reactivado con éxito.",
      "reseted-password-success": "Contraseña reseteada con éxito.",
    },
  });

  const { message: clientError } = useCrudError("user", {
    includeReactivable: true,
  });

  useEffect(() => {
    if (editingTargetId != null || resetPwd) {
      setShowForm(true);
      setFormMode(resetPwd ? "edit" : "edit");
    } else {
      setFormMode("create");
    }
  }, [editingTargetId, resetPwd]);

  useEffect(() => {
    if (formError) {
      setShowForm(true);
    }
  }, [formError]);

  useEffect(() => {
    if (showSuccess && !closedOnSuccessRef.current) {
      setShowForm(false);
      closedOnSuccessRef.current = true;
      if (
        location.search.includes("id=") ||
        location.search.includes("reset-password")
      ) {
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
    if (
      location.search.includes("id=") ||
      location.search.includes("reset-password")
    ) {
      navigate(cancelHref, { replace: true });
    }
  };

  return (
    <div className="settings-panel">
      <SettingsList actual="user" />
      <section className="settings-panel__section settings-panel__user">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de usuarios
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear usuario"}
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
                  {formMode === "edit" && currentEditingUser ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingUser.username} ]
                      </strong>
                    </>
                  ) : (
                    "Crear usuario"
                  )}
                </h3>
              </div>
              <UserForm
                key={
                  currentEditingUser
                    ? `update-${currentEditingUser.id}-user`
                    : resetPwd
                    ? "reset-password-user"
                    : "create-user"
                }
                action={action}
                editing={currentEditingUser}
                formAction={`.${location.search}`}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <UserTable users={users} editingId={editingTargetId} />
      </section>
    </div>
  );
}

export function UserPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de usuarios.";
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
