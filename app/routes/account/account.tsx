import {
  Link,
  Form,
  useActionData,
  useFetcher,
  useNavigation,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import type { Account } from "~/types/account";
import type { Flash } from "~/types/flash";
import { accountLoader } from "~/loaders/accountLoader";
export { accountLoader as loader };
import { accountAction } from "~/actions/account/accountAction";
export { accountAction as action };

export default function AccountListPage() {
  const { accounts, editingAccount, flash } = useLoaderData() as {
    accounts: Account[];
    editingAccount: Account | null;
    flash: Flash;
  };
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingAccount;
  const deleting = fetcher.state !== "idle";

  const [name, setName] = useState(editingAccount?.name ?? "");
  const [description, setDescription] = useState(
    editingAccount?.description ?? ""
  );

  useEffect(() => {
    if (isEditing) {
      setName(editingAccount?.name ?? "");
      setDescription(editingAccount?.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [editingAccount?.id, isEditing, location.key]);

  useEffect(() => {
    if (!isEditing && (flash.created || flash.updated)) {
    }
  }, [isEditing, flash.created, flash.updated]);

  return (
    <div>
      <h1>Cuentas</h1>
      <h2>{isEditing ? "Editar cuenta" : "Crear cuenta nueva"}</h2>

      {isEditing && (
        <p className="muted">
          Editando: <strong>{editingAccount!.name}</strong>{" "}
          <Link to="/account" replace className="btn">
            Cancelar edición
          </Link>
        </p>
      )}

      {flash.created && (
        <p className="flash flash--success">Cuenta creada con éxito.</p>
      )}
      {flash.updated && (
        <p className="flash flash--success">Cuenta modificada con éxito.</p>
      )}
      {flash.deleted && (
        <p className="flash flash--success">Cuenta eliminada con éxito.</p>
      )}
      {flash.error && (
        <p
          className={`flash ${
            flash.source === "client" ? "flash--warn" : "flash--error"
          }`}
        >
          {flash.error}
        </p>
      )}
      {actionData?.error && (
        <p
          className={`flash ${
            actionData.source === "client" ? "flash--warn" : "flash--error"
          }`}
        >
          {actionData.error}
        </p>
      )}

      <Form
        method="post"
        action={isEditing ? `.${location.search}` : "."}
        className="account-form"
      >
        <label htmlFor="name">Nombre *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-required
        />
        <label htmlFor="description">Descripción</label>
        <input
          id="description"
          name="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="hidden"
          name="_action"
          value={isEditing ? "update" : "create"}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>

        <p className="hint">(*) Campos obligatorios</p>
      </Form>

      <h2>Lista de cuentas</h2>
      {accounts.length === 0 ? (
        <p>No hay cuentas activas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr
                key={account.id}
                className={
                  editingAccount?.id === account.id ? "row row--editing" : "row"
                }
              >
                <td>{account.name}</td>
                <td>{account.description ?? "-"}</td>
                <td className="actions">
                  <Link to={`?id=${account.id}`}>
                    <button type="button">Modificar</button>
                  </Link>
                  <fetcher.Form
                    method="post"
                    action="."
                    onSubmit={(e) => {
                      if (!confirm("¿Seguro que desea eliminar esta cuenta?")) {
                        e.preventDefault();
                      }
                    }}
                    style={{ display: "inline-block", marginLeft: 8 }}
                  >
                    <input type="hidden" name="id" value={account.id} />
                    <input type="hidden" name="_action" value="delete" />
                    <button type="submit" disabled={deleting}>
                      {deleting ? "Eliminando..." : "Eliminar"}
                    </button>
                  </fetcher.Form>

                  {fetcher.data?.error && (
                    <div className="inline-error" role="alert">
                      {fetcher.data.error}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de cuentas.";
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
