import { useEffect, useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { BrandDTO } from "~/feature/brand/brand";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/prompts/ConfirmCascadeDeactivatePrompt";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { FaSpinner } from "react-icons/fa";

type Props = {
  brands: BrandDTO[];
  editingId?: number | null;
};

const BRAND_SORT_CONFIG: UseQuerySortingConfig<BrandDTO> = {
  defaultKey: "normalizedName",
  keys: [
    { key: "normalizedName", getValue: (brand) => brand.normalizedName },
    { key: "active", getValue: (brand) => brand.active },
  ],
};

export function BrandTable({ brands, editingId }: Props) {
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
  const [cascadeBrandId, setCascadeBrandId] = useState<number | null>(null);
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
    if (deactivateFetcher.state !== "idle") {
      return;
    }
    const data = deactivateFetcher.data as any;
    console.log("[BrandTable] deactivateFetcher idle", {
      data,
      lastAttemptedDeactivateId,
    });
    if (
      data &&
      data.code === "BRAND_IN_USE" &&
      lastAttemptedDeactivateId != null
    ) {
      setCascadeBrandId(lastAttemptedDeactivateId);
    } else {
      setCascadeBrandId(null);
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
    console.log("[BrandTable] reactivateFetcher idle", { data });
    if (!data || !data.code) {
      setCascadeBrandId(null);
      setLastAttemptedDeactivateId(null);
      setPendingDeactivateId(null);
    }
  }, [reactivateFetcher.data, reactivateFetcher.state]);

  const {
    sortedItems: sortedBrands,
    sortBy,
    sortDir,
  } = useQuerySorting(brands, BRAND_SORT_CONFIG);

  return (
    <>
      <div className="table-section table-section-brand">
        {sortedBrands.length === 0 ? (
          <p className="table__empty-msg">No hay marcas para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table table-brand">
              <thead className="table__head">
                <tr className="table__head-tr">
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="normalizedName"
                    className="name-brand"
                    label="Nombre"
                  />
                  {includeInactive && (
                    <SortToggle
                      currentSort={sortBy}
                      currentDir={sortDir}
                      name="active"
                      className="active-brand"
                      label="Estado"
                    />
                  )}
                  <th className="table__head-th th-action th-action-brand">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="table__body">
                {sortedBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className={
                      editingId === brand.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td td-name-brand">
                      {brand.name}
                    </td>
                    {includeInactive && (
                      <td className="table__item-td td-active-brand">
                        {brand.active ? (
                          <p className="status status--active">Activa</p>
                        ) : (
                          <p className="status status--inactive">Inactiva</p>
                        )}
                      </td>
                    )}
                    <td className="table__item-td td-action">
                      {brand.active ? (
                        <>
                          <Link
                            to={`?id=${brand.id}&includeInactive=${
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
                            onClick={() => setPendingDeactivateId(brand.id)}
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
                              cascadeBrandId === brand.id &&
                              data &&
                              data.code === "BRAND_IN_USE" &&
                              data.details?.count != null
                            ) {
                              return (
                                <ConfirmCascadeDeactivatePrompt
                                  entityId={brand.id}
                                  entityLabel="marca"
                                  dependentLabel="Producto"
                                  count={Number(data.details.count) || 0}
                                  strategyClear="clear-products-brand"
                                  strategyProceed="cascade-deactivate-products"
                                  clearLabel="Eliminar y desvincular productos"
                                  proceedLabel="Desactivar marca y productos"
                                  onCancel={() => {
                                    setCascadeBrandId(null);
                                    setLastAttemptedDeactivateId(null);
                                  }}
                                />
                              );
                            }
                            if (
                              cascadeBrandId === brand.id &&
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
                          onClick={() => setPendingReactivateId(brand.id)}
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
          message="¿Seguro que desea desactivar esta marca?"
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
          message="¿Seguro que desea reactivar esta marca?"
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
