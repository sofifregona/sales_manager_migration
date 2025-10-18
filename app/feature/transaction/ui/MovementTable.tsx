import { format } from "path";
import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { TransactionDTO } from "~/feature/transaction/transaction";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";
import { formatDateTime } from "~/utils/formatters/formatDateTime";

type Props = {
  transactions: TransactionDTO[];
  editingId?: number | null;
};

const MOVEMENT_SORT_CONFIG: UseQuerySortingConfig<TransactionDTO> = {
  defaultKey: "dateTime",
  keys: [
    { key: "dateTime", getValue: (transaction) => transaction.dateTime },
    { key: "account", getValue: (transaction) => transaction.account.name },
    { key: "amount", getValue: (transaction) => transaction.amount },
  ],
};

export function MovementTable({ transactions, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

  const {
    sortedItems: sortedTransactions,
    sortBy,
    sortDir,
  } = useQuerySorting(transactions, MOVEMENT_SORT_CONFIG);

  return (
    <>
      <h2>Lista de movimientos</h2>
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
      {sortedTransactions.length === 0 ? (
        <p>No hay transacciones para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="dateTime"
                label="Fecha y hora"
              />
              <th>Cuenta</th>
              <th>Monto</th>
              <th>Descripción</th>
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className={
                  editingId === transaction.id ? "row row--editing" : "row"
                }
              >
                <td>
                  {formatDateTime(transaction.dateTime, "dd-mm-yyyy hh:mm:ss")}
                </td>
                <td>{transaction.amount}</td>
                <td className="actions">
                  <Link to={`?id=${transaction.id}`}>
                    <button type="button">Modificar</button>
                  </Link>
                  <deactivateFetcher.Form
                    method="post"
                    action="."
                    onSubmit={(e) => {
                      if (
                        !confirm(
                          "¿Seguro que desea eliminar esta transacción? No podrá recuperar los datos."
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                    style={{ display: "inline-block", marginLeft: 8 }}
                  >
                    <input type="hidden" name="id" value={transaction.id} />
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
