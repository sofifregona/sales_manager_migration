import { Link, useFetcher } from "react-router-dom";
import type { SaleListLoaderData } from "~/feature/sale/types/sale";
import { FaCircle } from "react-icons/fa";

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
        <ul className="order-panel__employee-ul">
          {sortedEmployees.map((employee) => {
            const sale = sales.find(
              (s) => s.open && s.employee?.id === employee.id
            );
            return (
              <li key={employee.id} className="oder-panel__employee-li">
                {sale ? (
                  <Link className="employee-btn" to={`/sale/${sale.id}/edit`}>
                    <p className="employee-name">{employee.name}</p>
                    <FaCircle className="employee-item employee-item--active" />
                  </Link>
                ) : (
                  <employeeFetcher.Form method="post" action=".">
                    <input
                      type="hidden"
                      name="idEmployee"
                      value={employee.id}
                    />
                    <input type="hidden" name="prop" value="employee" />
                    <button type="submit" className="employee-btn">
                      <p className="employee-name">{employee.name}</p>
                      <FaCircle className="employee-item" />
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
