import React, { useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { UserDTO } from "~/feature/user/user";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";

type Props = {
  users: UserDTO[];
  editingId?: number | null;
};

const USER_SORT_CONFIG: UseQuerySortingConfig<UserDTO> = {
  defaultKey: "username",
  keys: [
    { key: "username", getValue: (user) => user.username },
    { key: "active", getValue: (user) => user.active },
  ],
};

export function UserTable({ users, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";
  const [pendingDeactivateId, setPendingDeactivateId] = useState<number | null>(
    null
  );
  const [pendingReactivateId, setPendingReactivateId] = useState<number | null>(
    null
  );

  const [lastDeactivateId, setLastDeactivateId] = useState<number | null>(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();

  const {
    sortedItems: sortedUsers,
    sortBy,
    sortDir,
  } = useQuerySorting(users, USER_SORT_CONFIG);

  return (
    <>
      <h2>Lista de usuarios</h2>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}
      >
        <Link
          replace
          to={`?includeInactive=${includeInactive ? "0" : "1"}`}
          className="btn btn--secondary"
        >
          {includeInactive ? "Ocultar inactivas" : "Ver inactivas"}
        </Link>
      </div>
      {sortedUsers.length === 0 ? (
        <p>No hay usuarios para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="username"
                label="Usuario"
              />
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="name"
                label="Nombre"
              />
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="rol"
                label="ROL"
              />
              <th style={{ width: 330 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr
                key={user.id}
                className={editingId === user.id ? "row row--editing" : "row"}
              >
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.role}</td>

                <td className="actions">
                  {user.active ? (
                    <>
                      <Link
                        to={`?id=${user.id}&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Modificar</button>
                      </Link>
                      <Link
                        to={`?id=${user.id}&reset-password=1&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Resetear contraseña</button>
                      </Link>
                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={deactivating}
                        onClick={() => setPendingDeactivateId(user.id)}
                      >
                        {deactivating ? "Desactivando..." : "Desactivar"}
                      </button>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.code === "ADMIN_PROTECT" &&
                          lastDeactivateId === user.id
                        ) {
                          return (
                            <div className="inline-error" role="alert">
                              No se puede eliminar el usuario ADMIN.
                            </div>
                          );
                        }
                        if (
                          data &&
                          data.error &&
                          !data.code &&
                          lastDeactivateId === user.id
                        ) {
                          return (
                            <div className="inline-error" role="alert">
                              {String(data.error)}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={reactivating}
                        onClick={() => setPendingReactivateId(user.id)}
                      >
                        {reactivating ? "Reactivando..." : "Reactivar"}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingDeactivateId != null && (
        <ConfirmPrompt
          message="¿Seguro que desea desactivar este usuario?"
          busy={deactivating}
          onCancel={() => setPendingDeactivateId(null)}
          onConfirm={() => {
            const id = pendingDeactivateId;
            setPendingDeactivateId(null);
            setLastDeactivateId(id);
            deactivateFetcher.submit(
              { id: String(id), _action: "deactivate" },
              { method: "post", action: `.${location.search}` }
            );
          }}
        />
      )}

      {pendingReactivateId != null && (
        <ConfirmPrompt
          message="¿Seguro que desea reactivar este usuario?"
          busy={reactivating}
          onCancel={() => setPendingReactivateId(null)}
          onConfirm={() => {
            const id = pendingReactivateId;
            setPendingReactivateId(null);
            reactivateFetcher.submit(
              { id: String(id), _action: "reactivate" },
              { method: "post", action: `.${location.search}` }
            );
          }}
        />
      )}
    </>
  );
}

      {reactivateFetcher.data && (reactivateFetcher.data as any).error && (
        <div className="inline-error" role="alert" style={{ marginTop: 8 }}>
          {String((reactivateFetcher.data as any).error)}
        </div>
      )}
