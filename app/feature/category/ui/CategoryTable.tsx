import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { CategoryDTO } from "~/feature/category/category";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";
import { DeactivateEntityPromptBanner } from "~/shared/ui/DeactivateEntityPromptBanner";

type Props = {
  categories: CategoryDTO[];
  editingId?: number | null;
};

const CATEGORY_SORT_CONFIG: UseQuerySortingConfig<CategoryDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (category) => category.name },
    { key: "active", getValue: (category) => category.active },
  ],
};

export function CategoryTable({ categories, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

  const {
    sortedItems: sortedCategories,
    sortBy,
    sortDir,
  } = useQuerySorting(categories, CATEGORY_SORT_CONFIG);

  return (
    <>
      <h2>Lista de categorías</h2>
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
      {sortedCategories.length === 0 ? (
        <p>No hay categorías para mostrar.</p>
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
            {sortedCategories.map((category) => (
              <tr
                key={category.id}
                className={
                  editingId === category.id ? "row row--editing" : "row"
                }
              >
                <td>{category.name}</td>
                {includeInactive && (
                  <td>{category.active ? "Activa" : "Inactiva"}</td>
                )}
                <td className="actions">
                  {category.active ? (
                    <>
                      <Link to={`?id=${category.id}`}>
                        <button type="button">Modificar</button>
                      </Link>
                      <deactivateFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              "¿Seguro que desea desactivar esta categoría?"
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={category.id} />
                          <input type="hidden" name="_action" value="deactivate" />
                        <button type="submit" disabled={deactivating}>
                          {deactivating ? "Desactivando..." : "Desactivar"}
                        </button>
                      </deactivateFetcher.Form>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.code === "CATEGORY_IN_USE" &&
                          data.details?.count != null
                        ) {
                          return (
                            <DeactivateEntityPromptBanner
                              entityId={category.id}
                              entityLabel="categoría"
                              count={Number(data.details.count) || 0}
                              strategyClear="clear-products-category"
                              strategyDeactivate="deactivate-products"
                              optionClearLabel="Quitar categoría de los productos"
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
                        <input type="hidden" name="id" value={category.id} />
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
