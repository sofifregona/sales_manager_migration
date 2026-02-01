import { useEffect, useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/prompts/ConfirmCascadeDeactivatePrompt";
import { FaEdit, FaTrash, FaTrashRestore, FaSpinner } from "react-icons/fa";

type Props = {
  accounts: AccountDTO[];
  editingId?: number | null;
};

const ACCOUNT_SORT_CONFIG: UseQuerySortingConfig<AccountDTO> = {
  defaultKey: "normalizedName",
  keys: [
    { key: "normalizedName", getValue: (account) => account.normalizedName },
    { key: "active", getValue: (account) => account.active },
  ],
};

export function AccountTable({ accounts, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const reactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivating = reactivateFetcher.state !== "idle";

  const [pendingDeactivateId, setPendingDeactivateId] = useState<number | null>(
    null
  );
  const [lastAttemptedDeactivateId, setLastAttemptedDeactivateId] = useState<
    number | null
  >(null);
  const [pendingReactivateId, setPendingReactivateId] = useState<number | null>(
    null
  );
  const [cascadeAccountId, setCascadeAccountId] = useState<number | null>(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();
  const clearCascadeState = () => {
    setCascadeAccountId(null);
    setLastAttemptedDeactivateId(null);
  };

  const {
    sortedItems: sortedAccounts,
    sortBy,
    sortDir,
  } = useQuerySorting(accounts, ACCOUNT_SORT_CONFIG);

  useEffect(() => {
    if (deactivateFetcher.state !== "idle") {
      return;
    }
    const data = deactivateFetcher.data as any;
    if (
      data &&
      data.code === "ACCOUNT_IN_USE" &&
      lastAttemptedDeactivateId != null
    ) {
      setCascadeAccountId(lastAttemptedDeactivateId);
    } else {
      setCascadeAccountId(null);
      setLastAttemptedDeactivateId(null);
    }
  }, [
    deactivateFetcher.data,
    deactivateFetcher.state,
    lastAttemptedDeactivateId,
  ]);

  return (
    <>
      <div className="table-section table-section-account">
        {sortedAccounts.length === 0 ? (
          <p className="table__empty-msg">No hay cuentas para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table table-account">
              <thead className="table__head">
                <tr className="table__head-tr">
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="normalizedName"
                    className="name-account"
                    label="Nombre"
                  />
                  {includeInactive && (
                    <SortToggle
                      currentSort={sortBy}
                      currentDir={sortDir}
                      name="active"
                      className="active-account"
                      label="Estado"
                    />
                  )}
                  <th className="table__head-th th-description-account">
                    Descripción
                  </th>
                  <th className="table__head-th th-action th-action-account">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="table__body">
                {sortedAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className={
                      editingId === account.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td td-name-account">
                      {account.name}
                    </td>
                    {includeInactive && (
                      <td className="table__item-td td-active-account">
                        {account.active ? (
                          <p className="status status--active">Activa</p>
                        ) : (
                          <p className="status status--inactive">Inactiva</p>
                        )}
                      </td>
                    )}
                    <td className="table__item-td td-description-account">
                      {account.description ?? <p className="td-empty">-</p>}
                    </td>
                    <td className="table__item-td td-action td-action-account">
                      {account.active ? (
                        <>
                          <Link
                            to={`?id=${account.id}&includeInactive=${
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
                            onClick={() => setPendingDeactivateId(account.id)}
                            className="delete-btn action-btn"
                          >
                            {deactivating ? (
                              <FaSpinner className="action-icon spinner" />
                            ) : (
                              "Desactivar"
                              // <FaTrash className="action-icon" />
                            )}
                          </button>

                          {(() => {
                            const data = deactivateFetcher.data as any;
                            if (
                              cascadeAccountId === account.id &&
                              data &&
                              data.code === "ACCOUNT_IN_USE" &&
                              data.details?.count != null
                            ) {
                              return (
                                <ConfirmCascadeDeactivatePrompt
                                  entityId={account.id}
                                  entityLabel="cuenta"
                                  dependentLabel="Método de pago"
                                  count={Number(data.details.count) || 0}
                                  strategyProceed="cascade-delete-payments"
                                  onCancel={() => {
                                    setCascadeAccountId(null);
                                    setLastAttemptedDeactivateId(null);
                                  }}
                                  proceedLabel="Aceptar"
                                />
                              );
                            }
                            if (
                              cascadeAccountId === account.id &&
                              data &&
                              data.error &&
                              !data.code
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
                            disabled={reactivating}
                            onClick={() => {
                              clearCascadeState();
                              setPendingReactivateId(account.id);
                            }}
                            className="reactivate-btn action-btn"
                          >
                            {reactivating ? (
                              <FaSpinner className="action-icon spinner" />
                            ) : (
                              "Reactivar"
                            )}
                          </button>
                        </>
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
          message="¿Seguro que desea desactivar esta cuenta?"
          busy={deactivating}
          onCancel={() => setPendingDeactivateId(null)}
          onConfirm={() => {
            const id = pendingDeactivateId;
            setPendingDeactivateId(null);
            setLastAttemptedDeactivateId(id);
            deactivateFetcher.submit(
              { id: String(id), _action: "deactivate" },
              { method: "post", action: `.${location.search}` }
            );
          }}
        />
      )}

      {pendingReactivateId != null && (
        <ConfirmPrompt
          message="¿Seguro que desea reactivar esta cuenta?"
          busy={reactivating}
          onCancel={() => setPendingReactivateId(null)}
          onConfirm={() => {
            const id = pendingReactivateId;
            setPendingReactivateId(null);
            clearCascadeState();
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
