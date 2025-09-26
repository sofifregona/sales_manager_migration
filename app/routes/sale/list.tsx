import {
  useLoaderData,
  useActionData,
  useFetcher,
  Link,
} from "react-router-dom";
import { saleListLoader } from "~/loaders/saleLoader";
import { createSaleAction } from "~/actions/sale/createSale";
import type { Sale } from "~/types/sale";
import type { Bartable } from "~/types/bartable";
import type { Employee } from "~/types/employee";
export { saleListLoader as loader };
export { createSaleAction as action };

export default function SaleListPage() {
  const { sales, bartables, employees } = useLoaderData() as {
    sales: Sale[];
    bartables: Bartable[];
    employees: Employee[];
  };

  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const sortedBartables = [...bartables.sort((a, b) => a.number - b.number)];
  const sortedEmployees = [
    ...employees.sort((a, b) => a.name.localeCompare(b.name)),
  ];

  const bartableFetcher = useFetcher();
  const employeeFetcher = useFetcher();

  return (
    <div>
      <h1>Ventas</h1>
      <h2>Mesas</h2>
      <ul>
        {sortedBartables.map((bartable) => {
          const sale = sales.find((sale) => sale.bartable?.id === bartable.id);

          return (
            <li key={bartable.id} className="row">
              {sale ? (
                <Link className="btn btn--green" to={`/sale/${sale.id}/edit`}>
                  <div className="btn__inner">{bartable.number}</div>
                </Link>
              ) : (
                <bartableFetcher.Form method="post" action=".">
                  <input type="hidden" name="idBartable" value={bartable.id} />
                  <input type="hidden" name="prop" value="bartable" />
                  <button type="submit" className="btn btn--gray">
                    <div className="btn__inner">{bartable.number}</div>
                  </button>
                </bartableFetcher.Form>
              )}
            </li>
          );
        })}
      </ul>

      <h2>Cuentas de empleados</h2>
      <ul>
        {sortedEmployees.map((employee) => {
          const sale = sales.find((sale) => sale.employee?.id === employee.id);

          return (
            <li key={employee.id} className="row">
              {sale ? (
                <Link className="btn btn--green" to={`/sale/${sale.id}/edit`}>
                  <div className="btn__inner">{employee.name}</div>
                </Link>
              ) : (
                <employeeFetcher.Form method="post" action=".">
                  <input type="hidden" name="idEmployee" value={employee.id} />
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
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la venta";
  if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div>
      <h2 style={{ color: "red" }}>Error</h2>
      <p>{message}</p>
    </div>
  );
}
