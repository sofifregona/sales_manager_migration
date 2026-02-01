import { useEffect, useState } from "react";
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
import { FaSpinner } from "react-icons/fa";

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
      <div className="table-section table-section-user">
        {sortedUsers.length === 0 ? (
          <p className="table__empty-msg">No hay usuarios para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table table-user">
              <thead className="table__head">
                <tr className="table__head-tr">
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="username"
                    className="username-user"
                    label="Usuario"
                  />
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="name"
                    className="name-user"
                    label="Nombre"
                  />
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="rol"
                    className="role-user"
                    label="Rol"
                  />
                  {includeInactive && (
                    <SortToggle
                      currentSort={sortBy}
                      currentDir={sortDir}
                      name="active"
                      className="active-user"
                      label="Estado"
                    />
                  )}
                  <th className="table__head-th th-action th-action-user">Acciones</th>
                </tr>
              </thead>
              <tbody className="table__body">
                {sortedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={
                      editingId === user.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td td-username-user">
                      {user.username}
                    </td>
                    <td className="table__item-td td-name-user">{user.name}</td>
                    <td className="table__item-td td-role-user">{user.role}</td>
                    {includeInactive && (
                      <td className="table__item-td td-active-user">
                        {user.active ? (
                          <p className="status status--active">Activo</p>
                        ) : (
                          <p className="status status--inactive">Inactivo</p>
                        )}
                      </td>
                    )}
                    <td className="table__item-td td-action td-action-user">
                      {user.active ? (
                        <>
                          <Link
                            to={`?id=${user.id}&includeInactive=${
                              includeInactive ? "1" : "0"
                            }`}
                            className="modify-link"
                          >
                            <button
                              type="button"
                              className="modify-btn action-btn"
                            >
                              Editar
                            </button>
                          </Link>
                          <Link
                            to={`?id=${user.id}&reset-password=1&includeInactive=${
                              includeInactive ? "1" : "0"
                            }`}
                            className="modify-link"
                          >
                            <button
                              type="button"
                              className="modify-btn action-btn"
                            >
                              Resetear contraseña
                            </button>
                          </Link>
                          <button
                            type="button"
                            disabled={deactivating}
                            onClick={() => setPendingDeactivateId(user.id)}
                            className="delete-btn action-btn"
                          >
                            {deactivating ? (
                              <FaSpinner className="action-icon spinner" />
                            ) : (
                              "Desactivar"
                            )}
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
                        <button
                          type="button"
                          disabled={reactivating}
                          onClick={() => setPendingReactivateId(user.id)}
                          className="reactivate-btn action-btn"
                        >
                          {reactivating ? (
                            <FaSpinner className="action-icon spinner" />
                          ) : (
                            "Reactivar"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
      {reactivateFetcher.data && (reactivateFetcher.data as any).error && (
        <div className="inline-error" role="alert" style={{ marginTop: 8 }}>
          {String((reactivateFetcher.data as any).error)}
        </div>
      )}
    </>
  );
}
