import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { UserDTO } from "~/feature/user/user";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";

type Props = {
  users: UserDTO[];
  editingId?: number | null;
};

const USER_SORT_CONFIG: UseQuerySortingConfig<UserDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (user) => user.username },
    { key: "active", getValue: (user) => user.active },
  ],
};

export function UserTable({ users, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

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
              <th>ROL</th>
              <th style={{ width: 220 }}>Acciones</th>
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
                  <Link to={`?id=${user.id}`}>
                    <button type="button">Modificar</button>
                  </Link>
                  <deactivateFetcher.Form
                    method="post"
                    action="."
                    onSubmit={(e) => {
                      if (
                        !confirm("¿Seguro que desea eliminar este usuario?")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    style={{ display: "inline-block", marginLeft: 8 }}
                  >
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="_action" value="deactivate" />
                    <button type="submit" disabled={deactivating}>
                      {deactivating ? "Desactivando..." : "Desactivar"}
                    </button>
                  </deactivateFetcher.Form>
                  <Link to={`?id=${user.id}&reset=1`}>
                    <button type="button" style={{ marginLeft: 8 }}>Reset</button>
                  </Link>

                  {deactivateFetcher.data?.error && (
                    <div className="inline-error" role="alert">
                      {String((deactivateFetcher.data as any).error)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
