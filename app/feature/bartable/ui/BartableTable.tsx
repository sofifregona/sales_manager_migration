import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { BartableDTO } from "~/feature/bartable/bartable";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";

type Props = {
  bartables: BartableDTO[];
  editingId?: number | null;
};

const BARTABLE_SORT_CONFIG: UseQuerySortingConfig<BartableDTO> = {
  defaultKey: "number",
  keys: [
    { key: "number", getValue: (bartable) => bartable.number },
    { key: "active", getValue: (bartable) => bartable.active },
  ],
};

export function BartableTable({ bartables, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

  const {
    sortedItems: sortedBartables,
    sortBy,
    sortDir,
  } = useQuerySorting(bartables, BARTABLE_SORT_CONFIG);

  return (
    <>
      <h2>Lista de mesas</h2>
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
      {sortedBartables.length === 0 ? (
        <p>No hay mesas para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="number"
                label="Número"
              />
              {includeInactive && (
                <SortToggle
                  currentSort={sortBy}
                  currentDir={sortDir}
                  name="status"
                  label="Estado"
                />
              )}
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedBartables.map((bartable) => (
              <tr
                key={bartable.id}
                className={
                  editingId === bartable.id ? "row row--editing" : "row"
                }
              >
                <td>{bartable.number}</td>
                {includeInactive && (
                  <td>{bartable.active ? "Activa" : "Inactiva"}</td>
                )}
                <td className="actions">
                  {bartable.active ? (
                    <>
                      <Link to={`?id=${bartable.id}`}>
                        <button type="button">Modificar</button>
                      </Link>
                      <deactivateFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(e) => {
                          if (
                            !confirm("¿Seguro que desea desactivar esta mesa?")
                          ) {
                            e.preventDefault();
                          }
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={bartable.id} />
                        <input type="hidden" name="_action" value="deactivate" />
                        <button type="submit" disabled={deactivating}>
                          {deactivating ? "Desactivando..." : "Desactivar"}
                        </button>
                      </deactivateFetcher.Form>

                      {deactivateFetcher.data?.error && (
                        <div className="inline-error" role="alert">
                          {String((deactivateFetcher.data as any).error)}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <reactivateFetcher.Form method="post" action=".">
                        <input type="hidden" name="id" value={bartable.id} />
                        <input
                          type="hidden"
                          name="_action"
                          value="reactivate"
                        />
                        <button type="submit" disabled={reactivating}>
                          {reactivating ? "Reactivando..." : "Reactivar"}
                        </button>
                      </reactivateFetcher.Form>

                      {reactivateFetcher.data?.error && (
                        <div className="inline-error" role="alert">
                          {String((reactivateFetcher.data as any).error)}
                        </div>
                      )}
                    </>
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
