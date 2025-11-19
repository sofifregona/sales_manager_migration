import {
  Link,
  useActionData,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import type { UserLoaderData } from "~/feature/user/user";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { UserForm } from "../ui/UserForm";
import { UserTable } from "../ui/UserTable";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";

export function UserPanelScreen() {
  const { users, editingUser, flash } = useLoaderData<UserLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");
  const isEditing = !!editingUser;
  const action =
    p.get("reset-password") === "1"
      ? "reset-password"
      : isEditing
      ? "update"
      : "create";

  useUrlSuccessFlash("user");
  const { message } = useCrudSuccess("user", {
    "created-success": "Usuario creado con éxito.",
    "updated-success": "Usuario modificado con éxito.",
    "deactivated-success": "Usuario eliminado con éxito.",
    "reactivated-success": "Usuario reactivado con éxito.",
    "reseted-password-success": "Contraseña reseteada con éxito.",
  });

  const { message: clientError } = useCrudError("user", {
    includeReactivable: true,
  });

  return (
    <div>
      <h1>Usuario</h1>
      <h2>
        {action === "reset-password"
          ? "Resetear contraseña"
          : action === "update"
          ? "Modificar usuario"
          : "Crear usuario"}
      </h2>
      {isEditing && (
        <p className="muted">
          Editando: <strong>{editingUser.username ?? "-"}</strong>{" "}
          <Link
            to={`/user${include ? `?includeInactive=${include}` : ""}`}
            replace
            className="btn"
          >
            Cancelar edición
          </Link>
        </p>
      )}

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}
      {clientError && <ErrorBanner message={clientError} />}

      <UserForm
        key={
          isEditing ? `update-${editingUser.id}-employee` : "create-employee"
        }
        action={action}
        editing={editingUser}
        formAction={`.${location.search}`}
      />

      <UserTable users={users} editingId={editingUser?.id ?? null} />
    </div>
  );
}

export function UserPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de usuarios.";
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

