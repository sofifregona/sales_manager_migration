import React, { useState } from "react";
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
import { SortToggle } from "~/shared/ui/SortToggle";
import { ConfirmCascadeDeactivateBanner } from "~/shared/ui/ConfirmCascadeDeactivateBanner";
import { ConfirmPrompt } from "~/shared/ui/ConfirmPrompt";
import { ConfirmCascadeDeactivatePrompt } from "~/shared/ui/ConfirmCascadeDeactivatePrompt";

type Props = {
  accounts: AccountDTO[];
  editingId?: number | null;
};

const ACCOUNT_SORT_CONFIG: UseQuerySortingConfig<AccountDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (account) => account.name },
    { key: "active", getValue: (account) => account.active },
  ],
};

export function AccountTable({ accounts, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";
  const [pendingDeactivateId, setPendingDeactivateId] = useState<number | null>(
    null
  );
  const [pendingReactivateId, setPendingReactivateId] = useState<number | null>(null);

  const [lastDeactivateId, setLastDeactivateId] = useState<number | null>(null);

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";
  const location = useLocation();

  const {
    sortedItems: sortedAccounts,
    sortBy,
    sortDir,
  } = useQuerySorting(accounts, ACCOUNT_SORT_CONFIG);

  return (
    <>
      <h2>Lista de cuentas</h2>
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
      {sortedAccounts.length === 0 ? (
        <p>No hay cuentas para mostrar.</p>
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
              {includeInactive && (
                <SortToggle
                  currentSort={sortBy}
                  currentDir={sortDir}
                  name="status"
                  label="Estado"
                />
              )}
              <th>Descripción</th>
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.map((account) => (
              <tr
                key={account.id}
                className={
                  editingId === account.id ? "row row--editing" : "row"
                }
              >
                <td>{account.name}</td>
                {includeInactive && (
                  <td>{account.active ? "Activa" : "Inactiva"}</td>
                )}
                <td>{account.description ?? "-"}</td>
                <td className="actions">
                  {account.active ? (
                    <>
                      <Link
                        to={`?id=${account.id}&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Modificar</button>
                      </Link>

                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={deactivating}
                        onClick={() => setPendingDeactivateId(account.id)}
                      >
                        {deactivating ? "Desactivando..." : "Desactivar"}
                      </button>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.code === "ACCOUNT_IN_USE" &&
                          data.details?.count != null && lastDeactivateId === account.id) {
                          return (
                            <ConfirmCascadeDeactivatePrompt
                              entityId={account.id}
                              entityLabel="cuenta"
                              dependentLabel="Método de pago"
                              count={Number(data.details.count) || 0}
                              strategyProceed="cascade-delete-payments"
                              onCancel={() => {
                                setLastDeactivateId(null)
                              }}
                              proceedLabel="Aceptar"
                            />
                          );
                        }
                        if (data && data.error && !data.code && lastDeactivateId === account.id) {
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
                      {/* <reactivateFetcher.Form
                        method="post"
                        action={`.${location.search}`}
                      >
                        <input type="hidden" name="id" value={account.id} />
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
                      )} */}
                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={reactivating}
                        onClick={() => setPendingReactivateId(account.id)}
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
          message="¿Seguro que desea desactivar esta cuenta?"
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
          message="¿Seguro que desea reactivar esta cuenta?"
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




