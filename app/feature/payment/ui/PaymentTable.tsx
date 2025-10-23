import React from "react";

import {
  Link,
  useFetcher,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import type { PaymentDTO } from "~/feature/payment/payment";

import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";

import { SortToggle } from "~/shared/ui/SortToggle";

import { ConfirmPrompt } from "~/shared/ui/ConfirmPrompt";

import { ConfirmReactivatePaymentWithAccountPrompt } from "~/shared/ui/ConfirmReactivatePaymentWithAccountPrompt";

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

  const [lastReactivateId, setLastReactivateId] = React.useState<number | null>(
    null
  );

  const [params] = useSearchParams();

  const includeInactive = params.get("includeInactive") === "1";

  const location = useLocation();

  // Auto-cierra el overlay cuando la reactivaci?n termina sin conflicto
  React.useEffect(() => {
    if (reactivateFetcher.state !== "idle") return;
    const data = reactivateFetcher.data as any;
    if (lastReactivateId != null && (!data || !data.code)) {
      setLastReactivateId(null);
    }
  }, [reactivateFetcher.state, reactivateFetcher.data, lastReactivateId]);

  const {
    sortedItems: sortedPayments,

    sortBy,

    sortDir,
  } = useQuerySorting(payments, PAYMENT_SORT_CONFIG);

  return (
    <>
      <h2>Lista de m?todos de pago</h2>

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
        <p>No hay m?todos de pago para mostrar.</p>
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
                      <Link
                        to={`?id=${payment.id}&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Modificar</button>
                      </Link>

                      <deactivateFetcher.Form
                        method="post"
                        action={`.${location.search}`}
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
                      <button
                        type="button"
                        disabled={reactivating}
                        onClick={() => {
                          setLastReactivateId(payment.id);

                          reactivateFetcher.submit(
                            { id: String(payment.id), _action: "reactivate" },

                            { method: "post", action: `.${location.search}` }
                          );
                        }}
                      >
                        {reactivating ? "Reactivando..." : "Reactivar"}
                      </button>

                      {reactivateFetcher.data?.error &&
                        !(reactivateFetcher.data as any).code && (
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
          message="?Seguro que desea desactivar este m?todo de pago?"
          busy={deactivating}
          onCancel={() => setPendingDeactivateId(null)}
          onConfirm={() => {
            const id = pendingDeactivateId;

            setPendingDeactivateId(null);

            deactivateFetcher.submit(
              { id: String(id), _action: "deactivate" },

              { method: "post", action: `.${location.search}` }
            );
          }}
        />
      )}

      {(() => {
        const data = reactivateFetcher.data as any;

        if (
          data &&
          data.code === "ACCOUNT_INACTIVE" &&
          typeof lastReactivateId === "number"
        ) {
          return (
            <ConfirmReactivatePaymentWithAccountPrompt
              paymentId={lastReactivateId as number}
              onCancel={() => setLastReactivateId(null)}
              onProceed={() => {
                const id = lastReactivateId as number;
                setLastReactivateId(null);
                reactivateFetcher.submit(
                  {
                    id: String(id),
                    _action: "reactivate",
                    strategy: "reactivate-account",
                  },
                  { method: "post", action: `.${location.search}` }
                );
              }}
              busy={reactivating}
            />
          );
        }

        return null;
      })()}
    </>
  );
}
