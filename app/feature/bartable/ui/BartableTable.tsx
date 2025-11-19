import React, { useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { BartableDTO } from "~/feature/bartable/bartable";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";

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
        {(() => {
          const p = new URLSearchParams(location.search);
          p.set("includeInactive", includeInactive ? "0" : "1");
          const toggleIncludeHref = `?${p.toString()}`;
          return (
            <Link replace to={toggleIncludeHref} className="btn btn--secondary">
              {includeInactive ? "Ocultar inactivas" : "Ver inactivas"}
            </Link>
          );
        })()}
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
                  name="active"
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
                      <Link
                        to={`?id=${bartable.id}&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Modificar</button>
                      </Link>
                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={deactivating}
                        onClick={() => setPendingDeactivateId(bartable.id)}
                      >
                        {deactivating ? "Desactivando..." : "Desactivar"}
                      </button>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.error &&
                          lastDeactivateId === bartable.id
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
                        onClick={() => setPendingReactivateId(bartable.id)}
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
          message="¿Seguro que desea desactivar esta mesa?"
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
          message="¿Seguro que desea reactivar esta mesa?"
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
