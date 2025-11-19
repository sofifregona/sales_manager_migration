import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import type { EmployeeLoaderData } from "~/feature/employee/employee";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";

import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { EmployeeForm } from "../ui/EmployeeForm";
import { EmployeeTable } from "../ui/EmployeeTable";
// Employee sin conflicto por cookie/overlay

import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";

export function EmployeePanelScreen() {
  const { employees, editingEmployee, flash } =
    useLoaderData<EmployeeLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");
  const isEditing = !!editingEmployee;

  useUrlSuccessFlash("employee");

  const { message, kind } = useCrudSuccess("employee", {
    "created-success": "Empleado creado con éxito.",
    "updated-success": "Empleado modificado con éxito.",
    "deactivated-success": "Empleado eliminado con éxito.",
    "reactivated-success": "Empleado reactivado con éxito.",
  });

  // Client errors banner; include reactivable as fallback, we'll hide it if prompt is shown
  const { message: clientError } = useCrudError("employee", {
    includeReactivable: true,
  });

  return (
    <div>
      <h1>Empleados</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="empleado"
        name={editingEmployee?.name.toString() ?? null}
        cancelHref={`/employee${include ? `?includeInactive=${include}` : ""}`}
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}
      {clientError && <ErrorBanner message={clientError} />}

      <EmployeeForm
        key={
          isEditing
            ? `update-${editingEmployee.id}-employee`
            : "create-employee"
        }
        isEditing={isEditing}
        editing={editingEmployee}
        formAction={`.${location.search}`}
      />

      <EmployeeTable
        employees={employees}
        editingId={editingEmployee?.id ?? null}
      />
    </div>
  );
}

export function EmployeePanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de empleados.";
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
