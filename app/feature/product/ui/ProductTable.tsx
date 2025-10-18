import React, { useMemo } from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { ProductDTO } from "~/feature/product/product";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";
import { useBulkSelection } from "../hooks/useBulkSelection";
import IncrementForm from "./IncrementPrices";

type Props = {
  products: ProductDTO[];
  editingId?: number | null;
};

const PRODUCT_SORT_CONFIG: UseQuerySortingConfig<ProductDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (product) => product.name },
    { key: "code", getValue: (product) => product.code },
    { key: "price", getValue: (product) => product.price },
    { key: "brand", getValue: (product) => product.brand?.name ?? "" },
    { key: "category", getValue: (product) => product.category?.name ?? "" },
    { key: "provider", getValue: (product) => product.provider?.name ?? "" },
  ],
};

export function ProductTable({ products, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

  const {
    sortedItems: sortedProducts,
    sortBy,
    sortDir,
  } = useQuerySorting(products, PRODUCT_SORT_CONFIG);

  const visibleIds = useMemo(
    () => sortedProducts.map((p) => p.id),
    [sortedProducts]
  );

  const {
    masterRef,
    selectedIds,
    allVisibleSelected,
    toggleAllVisible,
    toggleOne,
  } = useBulkSelection(visibleIds, editingId ?? null);

  return (
    <>
      <h2>Lista de productos</h2>
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
      {sortedProducts.length === 0 ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  ref={masterRef}
                  checked={allVisibleSelected}
                  onChange={(e) => toggleAllVisible(e.currentTarget.checked)}
                />
                {" Seleccionar todo"}
              </th>
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="name"
                label="Nombre"
              />
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="code"
                label="Código"
              />
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="price"
                label="Precio"
              />
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="brand"
                label="Marca"
              />
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="category"
                label="Categoría"
              />
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="provider"
                label="Proveedor"
              />
              <th>Descripción</th>
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
            {sortedProducts.map((product) => (
              <tr
                key={product.id}
                className={
                  editingId === product.id ? "row row--editing" : "row"
                }
              >
                <td>
                  <input
                    type="checkbox"
                    form="incrementForm"
                    name="ids"
                    value={String(product.id)}
                    checked={selectedIds.has(product.id)}
                    onChange={(e) =>
                      toggleOne(product.id, e.currentTarget.checked)
                    }
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.code.toString().padStart(3, "0")}</td>
                <td>{product.price}</td>
                <td>{product.brand?.name}</td>
                <td>{product.category?.name}</td>
                <td>{product.provider?.name}</td>
                {includeInactive && (
                  <td>{product.active ? "Activo" : "Inactivo"}</td>
                )}

                <td className="actions">
                  {product.active ? (
                    <>
                      <Link to={`?id=${product.id}`}>
                        <button type="button">Modificar</button>
                      </Link>
                      <deactivateFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              "¿Seguro que desea desactivar este producto?"
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={product.id} />
                        <input type="hidden" name="_action" value="delete" />
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
                        <input type="hidden" name="id" value={product.id} />
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

      <IncrementForm selectedIds={selectedIds} />
    </>
  );
}
