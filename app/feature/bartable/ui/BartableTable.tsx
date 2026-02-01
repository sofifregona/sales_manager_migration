import { useEffect, useState } from "react";
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
import { FaSpinner } from "react-icons/fa";

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
  const reactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
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

  const toggleIncludeHref = (() => {
    const p = new URLSearchParams(location.search);
    p.set("includeInactive", includeInactive ? "0" : "1");
    return `?${p.toString()}`;
  })();

  const {
    sortedItems: sortedBartables,
    sortBy,
    sortDir,
  } = useQuerySorting(bartables, BARTABLE_SORT_CONFIG);

  return (
    <>
      <div className="table-section">
        <h2 className="settings-panel__subtitle">Lista de mesas</h2>
        <Link
          replace
          to={toggleIncludeHref}
          className={
            includeInactive
              ? "inactive-btn inactive-btn--active"
              : "inactive-btn"
          }
        >
          {includeInactive ? "Ocultar inactivas" : "Ver inactivas"}
        </Link>

        {sortedBartables.length === 0 ? (
          <p className="table__empty-msg">No hay mesas para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr className="table__head-tr">
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
                  <th className="table__head-th action-th">Acciones</th>
                </tr>
              </thead>
              <tbody className="table__body">
                {sortedBartables.map((bartable) => (
                  <tr
                    key={bartable.id}
                    className={
                      editingId === bartable.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td bartable-number-td">
                      {bartable.number}
                    </td>
                    {includeInactive && (
                      <td className="table__item-td active-td bartable-active-td">
                        {bartable.active ? "Activa" : "Inactiva"}
                      </td>
                    )}
                    <td className="table__item-td action-td bartable-action-td">
                      {bartable.active ? (
                        <>
                          <Link
                            to={`?id=${bartable.id}&includeInactive=${
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

                          <button
                            type="button"
                            disabled={deactivating}
                            onClick={() => setPendingDeactivateId(bartable.id)}
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
                        <button
                          type="button"
                          className="reactivate-btn action-btn"
                          disabled={reactivating}
                          onClick={() => setPendingReactivateId(bartable.id)}
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

      {reactivateFetcher.data && (reactivateFetcher.data as any).error && (
        <div className="inline-error" role="alert" style={{ marginTop: 8 }}>
          {String((reactivateFetcher.data as any).error)}
        </div>
      )}
    </>
  );
}
