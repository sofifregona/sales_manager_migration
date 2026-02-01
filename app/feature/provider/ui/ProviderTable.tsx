import { useEffect, useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { ProviderDTO } from "~/feature/provider/provider";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/prompts/ConfirmCascadeDeactivatePrompt";
import { FaSpinner } from "react-icons/fa";

type Props = {
  providers: ProviderDTO[];
  editingId?: number | null;
};

const PROVIDER_SORT_CONFIG: UseQuerySortingConfig<ProviderDTO> = {
  defaultKey: "normalizedName",
  keys: [
    { key: "normalizedName", getValue: (provider) => provider.normalizedName },
    { key: "active", getValue: (provider) => provider.active },
  ],
};

const formatCuit = (value: number | string | null | undefined) => {
  if (value == null) return "";
  const digits = value.toString().replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
};

export function ProviderTable({ providers, editingId }: Props) {
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
  const [cascadeProviderId, setCascadeProviderId] = useState<number | null>(
    null
  );
  const [lastAttemptedDeactivateId, setLastAttemptedDeactivateId] = useState<
    number | null
  >(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();

  useEffect(() => {
    if (deactivateFetcher.state !== "idle") return;
    const data = deactivateFetcher.data as any;
    if (
      data &&
      data.code === "PROVIDER_IN_USE" &&
      lastAttemptedDeactivateId != null
    ) {
      setCascadeProviderId(lastAttemptedDeactivateId);
    } else {
      setCascadeProviderId(null);
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
    if (!data || !data.code) {
      setCascadeProviderId(null);
      setLastAttemptedDeactivateId(null);
      setPendingDeactivateId(null);
    }
  }, [reactivateFetcher.data, reactivateFetcher.state]);

  const {
    sortedItems: sortedProviders,
    sortBy,
    sortDir,
  } = useQuerySorting(providers, PROVIDER_SORT_CONFIG);

  return (
    <>
      <div className="table-section table-section-provider">
        {sortedProviders.length === 0 ? (
          <p className="table__empty-msg">No hay proveedores para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table table-provider">
              <thead className="table__head">
                <tr className="table__head-tr">
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="normalizedName"
                    className="name-provider"
                    label="Nombre"
                  />
                  <th className="table__head-th th-cuit-provider">CUIT</th>
                  <th className="table__head-th th-telephone-provider">
                    Teléfono
                  </th>
                  <th className="table__head-th th-email-provider">E-mail</th>
                  <th className="table__head-th th-address-provider">
                    Domicilio
                  </th>
                  {includeInactive && (
                    <SortToggle
                      currentSort={sortBy}
                      currentDir={sortDir}
                      name="active"
                      className="active-provider"
                      label="Estado"
                    />
                  )}
                  <th className="table__head-th th-action th-action-provider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="table__body">
                {sortedProviders.map((provider) => (
                  <tr
                    key={provider.id}
                    className={
                      editingId === provider.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td td-name-provider">
                      {provider.name}
                    </td>
                    <td className="table__item-td td-cuit-provider">
                      {provider.cuit != null ? (
                        formatCuit(provider.cuit)
                      ) : (
                        <p className="td-empty">-</p>
                      )}
                    </td>
                    <td className="table__item-td td-telephone-provider">
                      {provider.telephone != null ? (
                        provider.telephone
                      ) : (
                        <p className="td-empty">-</p>
                      )}
                    </td>
                    <td className="table__item-td td-email-provider">
                      {provider.email ? (
                        provider.email
                      ) : (
                        <p className="td-empty">-</p>
                      )}
                    </td>
                    <td className="table__item-td td-address-provider">
                      {provider.address ? (
                        provider.address
                      ) : (
                        <p className="td-empty">-</p>
                      )}
                    </td>
                    {includeInactive && (
                      <td className="table__item-td td-active-provider">
                        {provider.active ? (
                          <p className="status status--active">Activo</p>
                        ) : (
                          <p className="status status--inactive">Inactivo</p>
                        )}
                      </td>
                    )}
                    <td className="table__item-td td-action td-action-provider">
                      {provider.active ? (
                        <>
                          <Link
                            to={`?id=${provider.id}&includeInactive=${
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
                            onClick={() => setPendingDeactivateId(provider.id)}
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
                              cascadeProviderId === provider.id &&
                              data &&
                              data.code === "PROVIDER_IN_USE" &&
                              data.details?.count != null
                            ) {
                              return (
                                <ConfirmCascadeDeactivatePrompt
                                  entityId={provider.id}
                                  entityLabel="proveedor"
                                  dependentLabel="Producto"
                                  count={Number(data.details.count) || 0}
                                  strategyClear="clear-products-provider"
                                  strategyProceed="cascade-deactivate-products"
                                  clearLabel="Eliminar y desvincular productos"
                                  proceedLabel="Desactivar proveedor y productos"
                                  onCancel={() => {
                                    setCascadeProviderId(null);
                                    setLastAttemptedDeactivateId(null);
                                  }}
                                />
                              );
                            }
                            if (
                              cascadeProviderId === provider.id &&
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
                          disabled={reactivating}
                          onClick={() => setPendingReactivateId(provider.id)}
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
          message="¿Seguro que desea desactivar este proveedor?"
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
          message="¿Seguro que desea reactivar este proveedor?"
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
