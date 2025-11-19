import React, { useMemo, useState } from "react";
import { Link, useFetcher, useLocation, useSearchParams } from "react-router-dom";
import type { ProductDTO } from "~/feature/product/product";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { useBulkSelection } from "../hooks/useBulkSelection";
import IncrementForm from "./IncrementPrices";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";

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

  const [pendingDeactivateId, setPendingDeactivateId] = useState<number | null>(null);
  const [pendingReactivateId, setPendingReactivateId] = useState<number | null>(null);
  const [lastDeactivateId, setLastDeactivateId] = useState<number | null>(null);

  // Orden viene del server vÃ­a sortField/sortDirection en la URL
  const sp = new URLSearchParams(location.search);
  const sortBy = sp.get("sortField") ?? "name";
  const sortDir = sp.get("sortDirection")?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const displayedProducts = products ?? [];

  const visibleIds = useMemo(
    () => displayedProducts.map((p) => p.id),
    [displayedProducts]
  );

  const { masterRef, selectedIds, allVisibleSelected, toggleAllVisible, toggleOne } =
    useBulkSelection(visibleIds, editingId ?? null);

  return (
    <>
      <h2>Lista de productos</h2>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        {(() => {
          const p = new URLSearchParams(location.search);
          p.set("includeInactive", includeInactive ? "0" : "1");
          const toggleIncludeHref = `?${p.toString()}`;
          return (
            <Link replace to={toggleIncludeHref} className="btn btn--secondary">
              {includeInactive ? "Ocultar inactivos" : "Ver inactivos"}
            </Link>
          );
        })()}
      </div>

      {displayedProducts.length === 0 ? (
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
              <SortToggle currentSort={sortBy} currentDir={sortDir} name="name" label="Nombre" />
              <SortToggle currentSort={sortBy} currentDir={sortDir} name="code" label="Código" />
              <SortToggle currentSort={sortBy} currentDir={sortDir} name="price" label="Precio" />
              <SortToggle currentSort={sortBy} currentDir={sortDir} name="brand" label="Marca" />
              <SortToggle currentSort={sortBy} currentDir={sortDir} name="category" label="Categoría" />
              <SortToggle currentSort={sortBy} currentDir={sortDir} name="provider" label="Proveedor" />
              {includeInactive && <th>Estado</th>}
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map((product) => (
              <tr
                key={product.id}
                className={editingId === product.id ? "row row--editing" : "row"}
              >
                <td>
                  <input
                    type="checkbox"
                    form="incrementForm"
                    name="ids"
                    value={String(product.id)}
                    checked={selectedIds.has(product.id)}
                    onChange={(e) => toggleOne(product.id, e.currentTarget.checked)}
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.code.toString().padStart(3, "0")}</td>
                <td>{product.price}</td>
                <td>{product.brand?.name}</td>
                <td>{product.category?.name}</td>
                <td>{product.provider?.name}</td>
                {includeInactive && <td>{product.active ? "Activo" : "Inactivo"}</td>}

                <td className="actions">
                  {product.active ? (
                    <>
                      {(() => {
                        const p = new URLSearchParams(location.search);
                        p.set("id", String(product.id));
                        const href = `?${p.toString()}`;
                        return (
                          <Link to={href}>
                            <button type="button">Modificar</button>
                          </Link>
                        );
                      })()}
                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={deactivating}
                        onClick={() => setPendingDeactivateId(product.id)}
                      >
                        {deactivating ? "Desactivando..." : "Desactivar"}
                      </button>
                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (data && data.error && lastDeactivateId === product.id) {
                          return (
                            <div className="inline-error" role="alert">{String(data.error)}</div>
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
                        onClick={() => setPendingReactivateId(product.id)}
                      >
                        {reactivating ? "Reactivando..." : "Reactivar"}
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

      <IncrementForm selectedIds={selectedIds} />
    </>
  );
}
