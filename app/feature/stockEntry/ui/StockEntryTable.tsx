import { useState } from "react";
import {
  Link,
  useFetcher,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import type { ProviderDTO } from "~/feature/provider/provider";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/prompts/ConfirmCascadeDeactivatePrompt";
import type { StockEntryDTO } from "../stock-entry";
import { formatDateTime } from "~/utils/formatters/formatDateTime";

type Props = {
  stockEntries: StockEntryDTO[];
  editingId?: number | null;
};

export function StockEntryTable({ stockEntries, editingId }: Props) {
  const deleteFetcher = useFetcher();
  const deleting = deleteFetcher.state !== "idle";

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [lastDeactivateId, setLastDeactivateId] = useState<number | null>(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();

  return (
    <>
      <h2>Lista de ingresos de stock</h2>
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
      {stockEntries.length === 0 ? (
        <p>No hay ingresos de stock para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Registrado por</th>
              <th>Producto</th>
              <th>cantidad</th>
              <th>Proveedor</th>
              <th>Comentario</th>
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map((se) => (
              <tr
                key={se.id}
                className={editingId === se.id ? "row row--editing" : "row"}
              >
                <td>{formatDateTime(se.ocurredAt, "dd-mm-yyyy hh:mm:ss")}</td>
                <td>{se.createdBy.name}</td>
                <td>{se.product.name}</td>
                <td>{se.quantity}</td>
                <td>{se.provider?.name ?? ""}</td>
                <td>{se.comments}</td>
                <td className="actions">
                  <Link to={`?id=${se.id}`}>
                    <button type="button">Modificar</button>
                  </Link>

                  <button
                    type="button"
                    style={{ display: "inline-block", marginLeft: 8 }}
                    disabled={deleting}
                    onClick={() => setPendingDeleteId(se.id)}
                  >
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>

                  {(() => {
                    const data = deleteFetcher.data as any;
                    if (
                      data &&
                      data.error &&
                      !data.code &&
                      lastDeactivateId === se.id
                    ) {
                      return (
                        <div className="inline-error" role="alert">
                          {String(data.error)}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingDeleteId != null && (
        <ConfirmPrompt
          message="¿Seguro que desea eliminar este ingreso de stock? La información no podrá recuperarse"
          busy={deleting}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            const id = pendingDeleteId;
            setPendingDeleteId(null);
            setLastDeactivateId(id);
            deleteFetcher.submit(
              { id: String(id), _action: "deactivate" },
              { method: "post", action: `.${location.search}` }
            );
          }}
        />
      )}
    </>
  );
}
