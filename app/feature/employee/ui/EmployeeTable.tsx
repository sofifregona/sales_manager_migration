import React from "react";
import { Link, useFetcher, useSearchParams } from "react-router-dom";
import type { EmployeeDTO } from "~/feature/employee/employee";
import {
  type UseQuerySortingConfig,
  useQuerySorting,
} from "~/shared/hooks/useQuerySorting";
import { SortToggle } from "~/shared/ui/SortToggle";

type Props = {
  employees: EmployeeDTO[];
  editingId?: number | null;
};

const EMPLOYEE_SORT_CONFIG: UseQuerySortingConfig<EmployeeDTO> = {
  defaultKey: "name",
  keys: [
    { key: "name", getValue: (employee) => employee.name },
    { key: "active", getValue: (employee) => employee.active },
  ],
};

export function EmployeeTable({ employees, editingId }: Props) {
  const deactivateFetcher = useFetcher();
  const deactivating = deactivateFetcher.state !== "idle";
  const reactivateFetcher = useFetcher();
  const reactivating = reactivateFetcher.state !== "idle";

  const [params] = useSearchParams();
  const includeInactive = params.get("includeInactive") === "1";

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
                name="name"
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
                  name="status"
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
                      <Link to={`?id=${employee.id}`}>
                        <button type="button">Modificar</button>
                      </Link>
                      <deactivateFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              "¿Seguro que desea desactivar este empleado?"
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={employee.id} />
                          <input type="hidden" name="_action" value="deactivate" />
                        <button type="submit" disabled={deactivating}>
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
                        <input type="hidden" name="id" value={employee.id} />
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
    </>
  );
}
