import {
  Link,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import type { EmployeeLoaderData } from "~/feature/employee/employee";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import { EmployeeForm } from "../ui/EmployeeForm";
import { EmployeeTable } from "../ui/EmployeeTable";

import "./EmployeePanelScreen.sass";

export function EmployeePanelScreen() {
  const { employees, editingEmployee, flash } =
    useLoaderData<EmployeeLoaderData>();
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
  const cancelHref = `/settings/employee${
    include ? `?includeInactive=${include}` : ""
  }`;

  const currentEditingEmployee =
    editingTargetId != null && editingEmployee?.id === editingTargetId
      ? editingEmployee
      : null;
  const isEditing = !!currentEditingEmployee;
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Empleado creado con éxito.",
      "updated-success": "Empleado modificado con éxito.",
      "deactivated-success": "Empleado eliminado con éxito.",
      "reactivated-success": "Empleado reactivado con éxito.",
    },
  });

  const { message: clientError } = useCrudError("employee", {
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

  useEffect(() => {
    if (showSuccess) {
      setShowForm(false);
      if (location.search.includes("id=")) {
        navigate(cancelHref, { replace: true });
      }
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
      <SettingsList actual="employee" />
      <section className="settings-panel__section settings-panel__employee">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de empleados
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear empleado"}
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
                  {formMode === "edit" && currentEditingEmployee ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingEmployee.name} ]
                      </strong>
                    </>
                  ) : (
                    "Crear empleado"
                  )}
                </h3>
              </div>
              <EmployeeForm
                key={
                  currentEditingEmployee
                    ? `update-${currentEditingEmployee.id}-employee`
                    : "create-employee"
                }
                isEditing={isEditing}
                editing={currentEditingEmployee}
                formAction={`.${location.search}`}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <EmployeeTable employees={employees} editingId={editingTargetId} />
      </section>
    </div>
  );
}

export function EmployeePanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de empleados.";
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
