import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { ProviderDTO } from "~/feature/provider/provider";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";

type Props = {
  providers: ProviderDTO[];
  editingId?: number | null;
};

const PROVIDER_SORT_CONFIG: UseQuerySortingConfig<ProviderDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (provider) => provider.name },
    { key: "active", getValue: (provider) => provider.active },
  ],
};

export function ProviderTable({ providers, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

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
                name="name"
                label="Nombre"
              />
              <th>CUIT</th>
              <th>Telefono</th>
              <th>E-mail</th>
              <th>Domicilio</th>
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
            {sortedProviders.map((provider) => (
              <tr
                key={provider.id}
                className={
                  editingId === provider.id ? "row row--editing" : "row"
                }
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
                      <Link to={`?id=${provider.id}`}>
                        <button type="button">Modificar</button>
                      </Link>
                      <deactivateFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              "¿Seguro que desea desactivar esta cuenta?"
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={provider.id} />
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
                        <input type="hidden" name="id" value={provider.id} />
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
