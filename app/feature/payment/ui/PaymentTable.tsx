import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { PaymentDTO } from "~/feature/payment/payment";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/ConfirmPrompt";

type Props = {
  payments: PaymentDTO[];
  editingId?: number | null;
};

const PAYMENT_SORT_CONFIG: UseQuerySortingConfig<PaymentDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (payment) => payment.name },
    { key: "account", getValue: (payment) => payment.account.name },
    { key: "active", getValue: (payment) => payment.active },
  ],
};

export function PaymentTable({ payments, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";
  const [pendingDeactivateId, setPendingDeactivateId] = React.useState<
    number | null
  >(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

  const {
    sortedItems: sortedPayments,
    sortBy,
    sortDir,
  } = useQuerySorting(payments, PAYMENT_SORT_CONFIG);

  return (
    <>
      <h2>Lista de métodos de pago</h2>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}
      >
        <Link
          replace
          to={`?includeInactive=${includeInactive ? "0" : "1"}`}
          className="btn btn--secondary"
        >
          {includeInactive ? "Ocultar inactivos" : "Ver inactivos"}
        </Link>
      </div>
      {sortedPayments.length === 0 ? (
        <p>No hay métodos de pago para mostrar.</p>
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
              <SortToggle
                currentSort={sortBy}
                currentDir={sortDir}
                name="account"
                label="Cuenta"
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
            {sortedPayments.map((payment) => (
              <tr
                key={payment.id}
                className={
                  editingId === payment.id ? "row row--editing" : "row"
                }
              >
                <td>{payment.name}</td>
                <td>{payment.account.name}</td>
                {includeInactive && (
                  <td>{payment.active ? "Activa" : "Inactiva"}</td>
                )}
                <td className="actions">
                  {payment.active ? (
                    <>
                      <Link to={`?id=${payment.id}`}>
                        <button type="button">Modificar</button>
                      </Link>
                      <deactivateFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(e) => {
                          e.preventDefault();
                          setPendingDeactivateId(payment.id);
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={payment.id} />
                        <input
                          type="hidden"
                          name="_action"
                          value="deactivate"
                        />
                        <button
                          type="button"
                          disabled={deactivating}
                          onClick={() => setPendingDeactivateId(payment.id)}
                        >
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
                        <input type="hidden" name="id" value={payment.id} />
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

      {pendingDeactivateId != null && (
        <ConfirmPrompt
          message="¿Seguro que desea desactivar este método de pago?"
          busy={deactivating}
          onCancel={() => setPendingDeactivateId(null)}
          onConfirm={() => {
            const id = pendingDeactivateId;
            setPendingDeactivateId(null);
            deactivateFetcher.submit(
              { id: String(id), _action: "deactivate" },
              { method: "post", action: "." }
            );
          }}
        />
      )}
    </>
  );
}
