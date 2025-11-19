import { useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { CategoryDTO } from "~/feature/category/category";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/prompts/ConfirmCascadeDeactivatePrompt";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";

type Props = {
  categories: CategoryDTO[];
  editingId?: number | null;
};

const CATEGORY_SORT_CONFIG: UseQuerySortingConfig<CategoryDTO> = {
  defaultKey: "normalizedName",
  keys: [
    { key: "normalizedName", getValue: (category) => category.normalizedName },
    { key: "active", getValue: (category) => category.active },
  ],
};

export function CategoryTable({ categories, editingId }: Props) {
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
  const toggleIncludeHref = (() => {
    const p = new URLSearchParams(location.search);
    p.set("includeInactive", includeInactive ? "0" : "1");
    return `?${p.toString()}`;
  })();

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
        <Link replace to={toggleIncludeHref} className="btn btn--secondary">
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
                name="normalizedName"
                label="Nombre"
              />
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
            {sortedCategories.map((category) => (
              <tr
                key={category.id}
                className={editingId === category.id ? "row row--editing" : "row"}
              >
                <td>{category.name}</td>
                {includeInactive && (
                  <td>{category.active ? "Activa" : "Inactiva"}</td>
                )}
                <td className="actions">
                  {category.active ? (
                    <>
                      <Link
                        to={`?id=${category.id}&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Modificar</button>
                      </Link>

                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={deactivating}
                        onClick={() => setPendingDeactivateId(category.id)}
                      >
                        {deactivating ? "Desactivando..." : "Desactivar"}
                      </button>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.code === "CATEGORY_IN_USE" &&
                          data.details?.count != null &&
                          lastDeactivateId === category.id
                        ) {
                          return (
                            <ConfirmCascadeDeactivatePrompt
                              entityId={category.id}
                              entityLabel="Categoría"
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
                          lastDeactivateId === category.id
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
                        onClick={() => setPendingReactivateId(category.id)}
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
          message="¿Seguro que desea desactivar esta categoría?"
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
          message="¿Seguro que desea reactivar esta categoría?"
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

