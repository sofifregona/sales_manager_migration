import { Link, useFetcher } from "react-router-dom";
import type { SaleListLoaderData } from "~/feature/sale/types/sale";

type Props = {
  sales: SaleListLoaderData["sales"];
  employees: SaleListLoaderData["employees"];
};

export function EmployeeList({ sales, employees }: Props) {
  const sortedEmployees = [...employees].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const employeeFetcher = useFetcher();

  return (
    <section className="order-panel__employee-list">
      <h2 className="order-panel__title">Empleados</h2>
      {sortedEmployees.length === 0 ? (
        <p>No hay empleados activos.</p>
      ) : (
        <ul>
          {sortedEmployees.map((employee) => {
            const sale = sales.find(
              (s) => s.open && s.employee?.id === employee.id
            );
            return (
              <li key={employee.id} className="row">
                {sale ? (
                  <Link className="btn btn--green" to={`/sale/${sale.id}/edit`}>
                    <div className="btn__inner">{employee.name}</div>
                  </Link>
                ) : (
                  <employeeFetcher.Form method="post" action=".">
                    <input
                      type="hidden"
                      name="idEmployee"
                      value={employee.id}
                    />
                    <input type="hidden" name="prop" value="employee" />
                    <button type="submit" className="btn btn--grey">
                      <div className="btn__inner">{employee.name}</div>
                    </button>
                  </employeeFetcher.Form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
