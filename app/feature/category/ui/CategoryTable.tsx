import { useEffect, useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { CategoryDTO } from "~/feature/category/category";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/prompts/ConfirmCascadeDeactivatePrompt";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { FaSpinner } from "react-icons/fa";

type Props = {
  categories: CategoryDTO[];
  editingId?: number | null;
};

const CATEGORY_SORT_CONFIG: UseQuerySortingConfig<CategoryDTO> = {
  defaultKey: "normalizedName",
  keys: [
    { key: "normalizedName", getValue: (category) => category.normalizedName },
    { key: "active", getValue: (category) => category.active },
  ],
};

export function CategoryTable({ categories, editingId }: Props) {
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
  const [cascadeCategoryId, setCascadeCategoryId] = useState<number | null>(
    null
  );
  const [lastAttemptedDeactivateId, setLastAttemptedDeactivateId] = useState<
    number | null
  >(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();

  const toggleIncludeHref = (() => {
    const p = new URLSearchParams(location.search);
    p.set("includeInactive", includeInactive ? "0" : "1");
    return `?${p.toString()}`;
  })();

  useEffect(() => {
    if (deactivateFetcher.state !== "idle") return;
    const data = deactivateFetcher.data as any;
    console.log("[CategoryTable] deactivateFetcher idle", {
      data,
      lastAttemptedDeactivateId,
    });
    if (
      data &&
      data.code === "CATEGORY_IN_USE" &&
      lastAttemptedDeactivateId != null
    ) {
      setCascadeCategoryId(lastAttemptedDeactivateId);
    } else {
      setCascadeCategoryId(null);
      setLastAttemptedDeactivateId(null);
    }
  }, [
    deactivateFetcher.data,
    deactivateFetcher.state,
    lastAttemptedDeactivateId,
  ]);

  useEffect(() => {
    if (reactivateFetcher.state !== "idle") return;
    const data = reactivateFetcher.data as any;
    console.log("[CategoryTable] reactivateFetcher idle", { data });
    // Si reactivamos sin conflicto (sin code o sin data), limpiar estados de cascada/pending
    if (!data || !data.code) {
      setCascadeCategoryId(null);
      setLastAttemptedDeactivateId(null);
      setPendingDeactivateId(null);
    }
  }, [reactivateFetcher.data, reactivateFetcher.state]);

  const {
    sortedItems: sortedCategories,
    sortBy,
    sortDir,
  } = useQuerySorting(categories, CATEGORY_SORT_CONFIG);

  return (
    <>
      <div className="table-section table-section-category">
        {sortedCategories.length === 0 ? (
          <p className="table__empty-msg">No hay categorías para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table table-category">
              <thead className="table__head">
                <tr className="table__head-tr">
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="normalizedName"
                    className="name-category"
                    label="Nombre"
                  />
                  {includeInactive && (
                    <SortToggle
                      currentSort={sortBy}
                      currentDir={sortDir}
                      name="active"
                      className="active-category"
                      label="Estado"
                    />
                  )}
                  <th className="table__head-th th-action th-action-category">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="table__body">
                {sortedCategories.map((category) => (
                  <tr
                    key={category.id}
                    className={
                      editingId === category.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td td-name-category">
                      {category.name}
                    </td>
                    {includeInactive && (
                      <td className="table__item-td td-active-category">
                        {category.active ? (
                          <p className="status status--active">Activa</p>
                        ) : (
                          <p className="status status--inactive">Inactiva</p>
                        )}
                      </td>
                    )}
                    <td className="table__item-td td-action">
                      {category.active ? (
                        <>
                          <Link
                            to={`?id=${category.id}&includeInactive=${
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
                            onClick={() => setPendingDeactivateId(category.id)}
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
                              cascadeCategoryId === category.id &&
                              data &&
                              data.code === "CATEGORY_IN_USE" &&
                              data.details?.count != null
                            ) {
                              return (
                                <ConfirmCascadeDeactivatePrompt
                                  entityId={category.id}
                                  entityLabel="categoría"
                                  dependentLabel="Producto"
                                  count={Number(data.details.count) || 0}
                                  strategyClear="clear-products-category"
                                  strategyProceed="cascade-deactivate-products"
                                  clearLabel="Eliminar y desvincular productos"
                                  proceedLabel="Desactivar categoría y productos"
                                  onCancel={() => {
                                    setCascadeCategoryId(null);
                                    setLastAttemptedDeactivateId(null);
                                  }}
                                />
                              );
                            }
                            if (
                              cascadeCategoryId === category.id &&
                              data &&
                              data.error &&
                              !data.code
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
                          onClick={() => setPendingReactivateId(category.id)}
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
          message="¿Seguro que desea desactivar esta categoría?"
          busy={deactivating}
          onCancel={() => setPendingDeactivateId(null)}
          onConfirm={() => {
            const id = pendingDeactivateId;
            setPendingDeactivateId(null);
            setLastAttemptedDeactivateId(id);
            deactivateFetcher.submit(
              { id: String(id), _action: "deactivate" },
              { method: "post", action: `.${location.search}` }
            );
          }}
        />
      )}

      {pendingReactivateId != null && (
        <ConfirmPrompt
          message="¿Seguro que desea reactivar esta categoría?"
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
