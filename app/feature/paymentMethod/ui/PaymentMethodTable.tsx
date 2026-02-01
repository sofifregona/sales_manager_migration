import React from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import type { PaymentMethodDTO } from "~/feature/paymentMethod/payment-method";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { ConfirmReactivatePaymentMethodWithAccountPrompt } from "~/shared/ui/prompts/ConfirmReactivatePaymentMethodWithAccountPrompt";
import { useEffect, useState } from "react";

type Props = {
  paymentMethods: PaymentMethodDTO[];
  editingId?: number | null;
};

const PAYMENT_METHOD_SORT_CONFIG: UseQuerySortingConfig<PaymentMethodDTO> = {
  defaultKey: "normalizedName",
  keys: [
    {
      key: "normalizedName",
      getValue: (paymentMethod) =>
        (paymentMethod as any).normalizedName ??
        (paymentMethod.name || "")
          .normalize("NFD")
          .replace(/[^\p{L}\p{N}\s]/gu, "")
          .toLowerCase(),
    },
    {
      key: "account",
      getValue: (paymentMethod) =>
        (paymentMethod as any).account?.normalizedName ??
        (paymentMethod.account?.name || "")
          .normalize("NFD")
          .replace(/[^\p{L}\p{N}\s]/gu, "")
          .toLowerCase(),
    },
    { key: "active", getValue: (paymentMethod) => paymentMethod.active },
  ],
};

export function PaymentMethodTable({ paymentMethods, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const reactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivating = reactivateFetcher.state !== "idle";

  const [pendingDeactivateId, setPendingDeactivateId] = useState<number | null>(
    null
  );
  const [lastReactivateId, setLastReactivateId] = useState<number | null>(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();

  useEffect(() => {
    if (reactivateFetcher.state !== "idle") return;
    const data = reactivateFetcher.data as any;
    if (lastReactivateId != null && (!data || !data.code)) {
      setLastReactivateId(null);
    }
  }, [reactivateFetcher.state, reactivateFetcher.data, lastReactivateId]);

  const {
    sortedItems: sortedPaymentMethods,
    sortBy,
    sortDir,
  } = useQuerySorting(paymentMethods, PAYMENT_METHOD_SORT_CONFIG);

  return (
    <div className="table-section table-section-payment-method">
      {sortedPaymentMethods.length === 0 ? (
        <p className="table__empty-msg">No hay métodos de pago para mostrar.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table table-payment-method">
            <thead className="table__head">
              <tr className="table__head-tr">
                <SortToggle
                  currentSort={sortBy}
                  currentDir={sortDir}
                  name="normalizedName"
                  className="name-payment-method"
                  label="Nombre"
                />
                <SortToggle
                  currentSort={sortBy}
                  currentDir={sortDir}
                  name="account"
                  className="account-payment-method"
                  label="Cuenta"
                />
                {includeInactive && (
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="active"
                    className="active-payment-method"
                    label="Estado"
                  />
                )}
                <th className="table__head-th th-action th-action-payment-method">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="table__body">
              {sortedPaymentMethods.map((paymentMethod) => (
                <tr
                  key={paymentMethod.id}
                  className={
                    editingId === paymentMethod.id
                      ? "table__item-tr table__item-tr--editing"
                      : "table__item-tr"
                  }
                >
                  <td className="table__item-td td-name-payment-method">
                    {paymentMethod.name}
                  </td>
                  <td className="table__item-td td-account-payment-method">
                    {paymentMethod.account?.name ?? "-"}
                  </td>
                  {includeInactive && (
                    <td className="table__item-td td-active-payment-method">
                      {paymentMethod.active ? (
                        <p className="status status--active">Activa</p>
                      ) : (
                        <p className="status status--inactive">Inactiva</p>
                      )}
                    </td>
                  )}
                  <td className="table__item-td td-action">
                    {paymentMethod.active ? (
                      <>
                        <Link
                          to={`?id=${paymentMethod.id}&includeInactive=${
                            includeInactive ? "1" : "0"
                          }`}
                          className="modify-link"
                        >
                          <button
                            type="button"
                            className="modify-btn action-btn"
                          >
                            Editar
                          </button>
                        </Link>

                        <button
                          type="button"
                          disabled={deactivating}
                          onClick={() =>
                            setPendingDeactivateId(paymentMethod.id)
                          }
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
                            pendingDeactivateId === paymentMethod.id &&
                            data?.error
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
                      <button
                        type="button"
                        className="reactivate-btn action-btn"
                        disabled={reactivating}
                        onClick={() => {
                          setPendingDeactivateId(null);
                          setLastReactivateId(paymentMethod.id);
                          reactivateFetcher.submit(
                            {
                              id: String(paymentMethod.id),
                              _action: "reactivate",
                            },
                            { method: "post", action: `.${location.search}` }
                          );
                        }}
                      >
                        {reactivating ? (
                          <FaSpinner className="action-icon spinner" />
                        ) : (
                          "Reactivar"
                        )}
                      </button>
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
          message="¿Seguro que desea desactivar este método de pago?"
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

      {lastReactivateId != null && reactivateFetcher.data?.code && (
        <ConfirmReactivatePaymentMethodWithAccountPrompt
          paymentMethodId={lastReactivateId}
          busy={reactivateFetcher.state !== "idle"}
          error={(reactivateFetcher.data as any).error}
          accountName={(reactivateFetcher.data as any).details?.accountName}
          onCancel={() => setLastReactivateId(null)}
          onProceed={() => {
            const id = lastReactivateId;
            setLastReactivateId(null);
            reactivateFetcher.submit(
              { id: String(id), _action: "reactivate" },
              { method: "post", action: `.${location.search}` }
            );
          }}
        />
      )}
    </div>
  );
}
