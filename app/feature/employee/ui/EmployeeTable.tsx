import React, { useState } from "react";
import {
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { EmployeeDTO } from "~/feature/employee/employee";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { SortToggle } from "~/shared/ui/form/SortToggle";

type Props = {
  employees: EmployeeDTO[];
  editingId?: number | null;
};

const normalize = (s: string) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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

  const {
    sortedItems: sortedEmployees,
    sortBy,
    sortDir,
  } = useQuerySorting(employees, EMPLOYEE_SORT_CONFIG);

  return (
    <>
      <h2>Lista de empleados</h2>
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
      {sortedEmployees.length === 0 ? (
        <p>No hay empleados para mostrar.</p>
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
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
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
            {sortedEmployees.map((employee) => (
              <tr
                key={employee.id}
                className={
                  editingId === employee.id ? "row row--editing" : "row"
                }
              >
                <td>{employee.name}</td>
                <td>{employee.dni}</td>
                <td>{employee.telephone}</td>
                <td>{employee.email}</td>
                <td>{employee.address}</td>
                {includeInactive && (
                  <td>{employee.active ? "Activo" : "Inactivo"}</td>
                )}
                <td className="actions">
                  {employee.active ? (
                    <>
                      <Link
                        to={`?id=${employee.id}&includeInactive=${
                          includeInactive ? "1" : "0"
                        }`}
                      >
                        <button type="button">Modificar</button>
                      </Link>
                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={deactivating}
                        onClick={() => setPendingDeactivateId(employee.id)}
                      >
                        {deactivating ? "Desactivando..." : "Desactivar"}
                      </button>

                      {(() => {
                        const data = deactivateFetcher.data as any;
                        if (
                          data &&
                          data.error &&
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
                    <>
                      <button
                        type="button"
                        style={{ display: "inline-block", marginLeft: 8 }}
                        disabled={reactivating}
                        onClick={() => setPendingReactivateId(employee.id)}
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
    </>
  );
}
