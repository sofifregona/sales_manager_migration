import React, { useMemo, useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { ProductDTO } from "~/feature/product/product";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { useBulkSelection } from "../hooks/useBulkSelection";
import IncrementForm from "./IncrementPrices";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { FaEdit, FaTrashRestore } from "react-icons/fa";
import { FaTrash, FaSpinner } from "react-icons/fa";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProviderDTO } from "~/feature/provider/provider";
import { LuPackageCheck } from "react-icons/lu";
import { LuPackageMinus } from "react-icons/lu";
import LuPackageWarning from "~/feature/product/assets/svg/LuPackageWarning";

type Props = {
  products: ProductDTO[];
  brands: BrandDTO[];
  categories: CategoryDTO[];
  providers: ProviderDTO[];
  editingId?: number | null;
  showIncrement: boolean;
};

export function ProductTable({
  products,
  editingId,
  brands,
  categories,
  providers,
  showIncrement,
}: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();

  const [pendingDeactivateId, setPendingDeactivateId] = useState<number | null>(
    null
  );
  const [pendingReactivateId, setPendingReactivateId] = useState<number | null>(
    null
  );
  const [lastDeactivateId, setLastDeactivateId] = useState<number | null>(null);

  // Orden viene del server vía sortField/sortDirection en la URL
  const sp = new URLSearchParams(location.search);
  const sortBy = sp.get("sortField") ?? "name";
  const sortDir =
    sp.get("sortDirection")?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const displayedProducts = products ?? [];

  const visibleIds = useMemo(
    () => displayedProducts.map((p) => p.id),
    [displayedProducts]
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
      <div className="table-section table-section-product">
        {showIncrement && <IncrementForm selectedIds={selectedIds} />}

        {displayedProducts.length === 0 ? (
          <p className="table__empty-msg">No hay productos para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table product-table">
              <thead className="table__head">
                <tr className="table__head-tr">
                  <th className="table__head-th th-img-product">Foto</th>
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="normalizedName"
                    className="name-product"
                    label="Nombre"
                  />
                  <th className="table__head-th th-stock-product">Stock</th>
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="code"
                    className="code-product"
                    label="Cód."
                  />
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="price"
                    className="price-product"
                    label="Precio"
                  />
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="brand"
                    className="brand-product"
                    label="Marca"
                  />
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="category"
                    className="category-product"
                    label="Cat."
                  />
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="provider"
                    className="provider-product"
                    label="Prov."
                  />
                  {includeInactive && (
                    <SortToggle
                      currentSort={sortBy}
                      currentDir={sortDir}
                      name="active"
                      className="active-product"
                      label="Estado"
                    />
                  )}
                  {showIncrement ? (
                    <th className="table__head-th th-check">
                      <input
                        type="checkbox"
                        ref={masterRef}
                        checked={allVisibleSelected}
                        onChange={(e) =>
                          toggleAllVisible(e.currentTarget.checked)
                        }
                        className="th-check__input check__all"
                      />
                      {" Seleccionar todo"}
                    </th>
                  ) : (
                    <th className="table__head-th th-action-product">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="table__body">
                {displayedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={
                      editingId === product.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td td-foto-product">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt="Previsualización de la imagen del producto"
                          className="table-img-prev"
                        />
                      )}
                    </td>
                    <td
                      className="table__item-td td-name-product"
                      title={product.name}
                    >
                      {product.name}
                    </td>
                    <td className="table__item-td td-stock-product">
                      <div className="td-stock__icons">
                        <LuPackageCheck
                          className={
                            product.stockEnabled
                              ? "stock-icon stock-icon--active"
                              : "stock-icon"
                          }
                        />
                        <LuPackageMinus
                          className={
                            product.negativeQuantityWarning
                              ? "stock-icon stock-icon--active"
                              : "stock-icon"
                          }
                        />
                        <LuPackageWarning
                          className={
                            product.minQuantityWarning
                              ? "stock-icon stock-icon--active"
                              : "stock-icon"
                          }
                        />
                      </div>
                    </td>
                    <td className="table__item-td td-code-product">
                      {product.code.toString().padStart(3, "0")}
                    </td>
                    <td className="table__item-td td-price-product">
                      $ {product.price}
                    </td>
                    <td
                      className="table__item-td td-brand-product"
                      title={product.brand?.name}
                    >
                      {product.brand?.name ?? ""}
                    </td>
                    <td
                      className="table__item-td td-category-product"
                      title={product.category?.name}
                    >
                      {product.category?.name ?? ""}
                    </td>
                    <td
                      className="table__item-td td-provider-product"
                      title={product.provider?.name}
                    >
                      {product.provider?.name ?? ""}
                    </td>
                    {includeInactive && (
                      <td className="table__item-td active-td td-active-product">
                        {product.active ? (
                          <p className="status status--active">Activo</p>
                        ) : (
                          <p className="status status--inactive">Inactivo</p>
                        )}
                      </td>
                    )}

                    <td className="table__item-td td-action td-action-product">
                      {showIncrement ? (
                        <input
                          type="checkbox"
                          form="incrementForm"
                          name="ids"
                          className="check-td check"
                          value={String(product.id)}
                          checked={selectedIds.has(product.id)}
                          onChange={(e) =>
                            toggleOne(product.id, e.currentTarget.checked)
                          }
                        />
                      ) : product.active ? (
                        <>
                          {(() => {
                            const p = new URLSearchParams(location.search);
                            p.set("id", String(product.id));
                            const href = `?${p.toString()}`;
                            return (
                              <Link to={href}>
                                <button
                                  className="modify-btn action-btn"
                                  type="button"
                                >
                                  Editar
                                </button>
                              </Link>
                            );
                          })()}
                          <button
                            type="button"
                            disabled={deactivating}
                            onClick={() => setPendingDeactivateId(product.id)}
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
                              lastDeactivateId === product.id
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
                        <div className="section-increment-price">
                          <button
                            type="button"
                            className="reactivate-btn action-btn"
                            disabled={reactivating}
                            onClick={() => setPendingReactivateId(product.id)}
                          >
                            {reactivating ? (
                              <FaSpinner className="action-icon spinner" />
                            ) : (
                              "Reactivar"
                            )}
                          </button>
                          {reactivateFetcher.data?.error && (
                            <div className="inline-error" role="alert">
                              {String((reactivateFetcher.data as any).error)}
                            </div>
                          )}
                        </div>
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
          message="¿Seguro que desea desactivar este producto?"
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
          message="¿Seguro que desea reactivar este producto?"
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
