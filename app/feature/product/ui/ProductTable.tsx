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

type Props = {
  products: ProductDTO[];
  editingId?: number | null;
};

export function ProductTable({ products, editingId }: Props) {
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

  const [incrementForm, setIncrementForm] = useState(false);

  return (
    <>
      <div className="table-section">
        <h2 className="settings-panel__subtitle">Lista de productos</h2>
        {(() => {
          const p = new URLSearchParams(location.search);
          p.set("includeInactive", includeInactive ? "0" : "1");
          const toggleIncludeHref = `?${p.toString()}`;
          return (
            <Link
              replace
              to={toggleIncludeHref}
              className={
                includeInactive
                  ? "inactive-btn inactive-btn--active"
                  : "inactive-btn"
              }
            >
              {includeInactive ? "Ocultar inactivos" : "Ver inactivos"}
            </Link>
          );
        })()}
      </div>

      {displayedProducts.length === 0 ? (
        <p className="table__empty-msg">No hay productos para mostrar.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr className="table__head-tr">
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
                {includeInactive && (
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="active"
                    label="Estado"
                  />
                )}
                {incrementForm ? (
                  <th className="table__head-th check-th">
                    <input
                      type="checkbox"
                      ref={masterRef}
                      checked={allVisibleSelected}
                      onChange={(e) => toggleAllVisible(e.currentTarget.checked)}
                      className="check-th check__all"
                    />
                    {" Seleccionar todo"}
                  </th>
                ) : (
                  <th className="table__head-th action-th">Acciones</th>
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
                  <td className="table__item-td product-name-td">
                    {product.name}
                  </td>
                  <td className="table__item-td product-code-td">
                    {product.code.toString().padStart(3, "0")}
                  </td>
                  <td className="table__item-td product-price-td">
                    {product.price}
                  </td>
                  <td className="table__item-td product-brand-td">
                    {product.brand?.name}
                  </td>
                  <td className="table__item-td product-category-td">
                    {product.category?.name}
                  </td>
                  <td className="table__item-td product-provider-td">
                    {product.provider?.name}
                  </td>
                  {includeInactive && (
                    <td className="table__item-td active-td product-active-td">
                      {product.active ? "Activo" : "Inactivo"}
                    </td>
                  )}

                  <td className="table__item-td action-td product-action-td">
                    {incrementForm ? (
                      <td className="table__item-td product-check-td">
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
                      </td>
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
                      <>
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
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      <button type="button" onClick={() => setIncrementForm((prev) => !prev)}>
        Incrementar precios por grupo
      </button>
      {incrementForm && <IncrementForm selectedIds={selectedIds} />}
    </>
  );
}
