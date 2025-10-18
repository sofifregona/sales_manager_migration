import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { BrandDTO } from "~/feature/brand/brand";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";
import { DeactivateEntityPromptBanner } from "~/shared/ui/DeactivateEntityPromptBanner";

type Props = {
  brands: BrandDTO[];
  editingId?: number | null;
};

const BRAND_SORT_CONFIG: UseQuerySortingConfig<BrandDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (brand) => brand.name },
    { key: "active", getValue: (brand) => brand.active },
  ],
};

export function BrandTable({ brands, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

  const {
    sortedItems: sortedBrands,
    sortBy,
    sortDir,
  } = useQuerySorting(brands, BRAND_SORT_CONFIG);

  return (
    <>
      <h2>Lista de marcas</h2>
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
      {sortedBrands.length === 0 ? (
        <p>No hay marcas para mostrar.</p>
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
            {sortedBrands.map((brand) => (
              <tr
                key={brand.id}
                className={editingId === brand.id ? "row row--editing" : "row"}
              >
                <td>{brand.name}</td>
                {includeInactive && (
                  <td>{brand.active ? "Activa" : "Inactiva"}</td>
                )}
                <td className="actions">
                  {brand.active ? (
                    <>
                      <Link to={`?id=${brand.id}`}>
                        <button type="button">Modificar</button>
                      </Link>
                      <deactivateFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(e) => {
                          if (
                            !confirm("¿Seguro que desea desactivar esta marca?")
                          ) {
                            e.preventDefault();
                          }
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={brand.id} />
                          <input type="hidden" name="_action" value="deactivate" />
                        <button type="submit" disabled={deactivating}>
                          {deactivating ? "Desactivando..." : "Desactivar"}
                        </button>
                      </deactivateFetcher.Form>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.code === "BRAND_IN_USE" &&
                          data.details?.count != null
                        ) {
                          return (
                            <DeactivateEntityPromptBanner
                              entityId={brand.id}
                              entityLabel="marca"
                              count={Number(data.details.count) || 0}
                              strategyClear="clear-products-brand"
                              strategyDeactivate="deactivate-products"
                              optionClearLabel="Quitar marca de los productos"
                              optionDeactivateLabel="Desactivar productos asociados"
                              onCancel={() => {
                                /* no-op */
                              }}
                            />
                          );
                        }
                        if (data && data.error && !data.code) {
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
                      <reactivateFetcher.Form method="post" action=".">
                        <input type="hidden" name="id" value={brand.id} />
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
