import { useState } from "react";
import { Link, useFetcher, useSearchParams, useLocation } from "react-router-dom";
import type { ProviderDTO } from "~/feature/provider/provider";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/prompts/ConfirmCascadeDeactivatePrompt";

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

export function ProviderTable({ providers, editingId }: Props) {
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
    sortedItems: sortedProviders,
    sortBy,
    sortDir,
  } = useQuerySorting(providers, PROVIDER_SORT_CONFIG);

  return (
    <>
      <h2>Lista de proveedores</h2>
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
      {sortedProviders.length === 0 ? (
        <p>No hay proveedores para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="normalizedName"
                label="Nombre"
              />
              <th>CUIT</th>
              <th>Teléfono</th>
              <th>E-mail</th>
              <th>Domicilio</th>
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
            {sortedProviders.map((provider) => (
              <tr
                key={provider.id}
                className={editingId === provider.id ? "row row--editing" : "row"}
              >
                <td>{provider.name}</td>
                <td>{provider.cuit}</td>
                <td>{provider.telephone}</td>
                <td>{provider.email}</td>
                <td>{provider.address}</td>
                {includeInactive && (
                  <td>{provider.active ? "Activa" : "Inactiva"}</td>
                )}
                <td className="actions">
                  {provider.active ? (
                    <>
                      <Link
                        to={`?id=${provider.id}&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Modificar</button>
                      </Link>

                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={deactivating}
                        onClick={() => setPendingDeactivateId(provider.id)}
                      >
                        {deactivating ? "Desactivando..." : "Desactivar"}
                      </button>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.code === "PROVIDER_IN_USE" &&
                          data.details?.count != null &&
                          lastDeactivateId === provider.id
                        ) {
                          return (
                            <ConfirmCascadeDeactivatePrompt
                              entityId={provider.id}
                              entityLabel="Proveedor"
                              dependentLabel="Producto"
                              count={Number(data.details.count) || 0}
                              strategyProceed="cascade-deactivate-products"
                              onCancel={() => {
                                setLastDeactivateId(null);
                              }}
                              proceedLabel="Aceptar"
                            />
                          );
                        }
                        if (
                          data &&
                          data.error &&
                          !data.code &&
                          lastDeactivateId === provider.id
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
                        onClick={() => setPendingReactivateId(provider.id)}
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
          message="¿Seguro que desea desactivar este proveedor?"
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



