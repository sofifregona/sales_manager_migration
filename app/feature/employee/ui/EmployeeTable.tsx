import { useEffect, useState } from "react";
import { Link, useFetcher, useLocation, useSearchParams } from "react-router-dom";
import type { EmployeeDTO } from "~/feature/employee/employee";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { SortToggle } from "~/shared/ui/form/SortToggle";
import { FaSpinner } from "react-icons/fa";

type Props = {
  employees: EmployeeDTO[];
  editingId?: number | null;
};

const normalize = (s: string) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const EMPLOYEE_SORT_CONFIG: UseQuerySortingConfig<EmployeeDTO> = {
  defaultKey: "normalizedName",
  keys: [
    {
      key: "normalizedName",
      getValue: (employee) => (employee as any).normalizedName ?? normalize(employee.name),
    },
    { key: "active", getValue: (employee) => employee.active },
  ],
};

export function EmployeeTable({ employees, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const reactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
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

  useEffect(() => {
    if (reactivateFetcher.state !== "idle") return;
    const data = reactivateFetcher.data as any;
    if (!data || !data.code) {
      setPendingDeactivateId(null);
    }
  }, [reactivateFetcher.data, reactivateFetcher.state]);

  const {
    sortedItems: sortedEmployees,
    sortBy,
    sortDir,
  } = useQuerySorting(employees, EMPLOYEE_SORT_CONFIG);

  return (
    <>
      <div className="table-section table-section-employee">
        {sortedEmployees.length === 0 ? (
          <p className="table__empty-msg">No hay empleados para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table table-employee">
              <thead className="table__head">
                <tr className="table__head-tr">
                  <SortToggle
                    currentSort={sortBy}
                    currentDir={sortDir}
                    name="normalizedName"
                    className="name-employee"
                    label="Nombre"
                  />
                  <th className="table__head-th th-dni-employee">DNI</th>
                  <th className="table__head-th th-telephone-employee">Teléfono</th>
                  <th className="table__head-th th-email-employee">E-mail</th>
                  <th className="table__head-th th-address-employee">Domicilio</th>
                  {includeInactive && (
                    <SortToggle
                      currentSort={sortBy}
                      currentDir={sortDir}
                      name="active"
                      className="active-employee"
                      label="Estado"
                    />
                  )}
                  <th className="table__head-th th-action th-action-employee">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="table__body">
                {sortedEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={
                      editingId === employee.id
                        ? "table__item-tr table__item-tr--editing"
                        : "table__item-tr"
                    }
                  >
                    <td className="table__item-td td-name-employee">
                      {employee.name}
                    </td>
                    <td className="table__item-td td-dni-employee">
                      {employee.dni ?? <p className="td-empty">-</p>}
                    </td>
                    <td className="table__item-td td-telephone-employee">
                      {employee.telephone ?? <p className="td-empty">-</p>}
                    </td>
                    <td className="table__item-td td-email-employee">
                      {employee.email ? employee.email : <p className="td-empty">-</p>}
                    </td>
                    <td className="table__item-td td-address-employee">
                      {employee.address ? employee.address : <p className="td-empty">-</p>}
                    </td>
                    {includeInactive && (
                      <td className="table__item-td td-active-employee">
                        {employee.active ? (
                          <p className="status status--active">Activo</p>
                        ) : (
                          <p className="status status--inactive">Inactivo</p>
                        )}
                      </td>
                    )}
                    <td className="table__item-td td-action td-action-employee">
                      {employee.active ? (
                        <>
                          <Link
                            to={`?id=${employee.id}&includeInactive=${
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
                            onClick={() => setPendingDeactivateId(employee.id)}
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
                              !data.code &&
                              lastDeactivateId === employee.id
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
                          disabled={reactivating}
                          onClick={() => setPendingReactivateId(employee.id)}
                          className="reactivate-btn action-btn"
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
      </div>

      {pendingDeactivateId != null && (
        <ConfirmPrompt
          message="¿Seguro que desea desactivar este empleado?"
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
          message="¿Seguro que desea reactivar este empleado?"
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
