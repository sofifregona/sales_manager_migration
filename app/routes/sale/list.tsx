import {
  useLoaderData,
<<<<<<< HEAD
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
=======
  useFetcher,
  Link,
  Form,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Sale } from "~/types/sale";
import { providerListLoader } from "~/loaders/providerLoader";
export { providerListLoader as loader };

export default function ProviderListPage() {
  const providers = useLoaderData() as Provider[];
  const fetcher = useFetcher();
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87

  return (
    <div>
      <h1>Ventas</h1>
      <h2>Mesas</h2>
      <ul>
<<<<<<< HEAD
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
                  <input type="hidden" name="idProp" value="bartable" />
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
                  <input type="hidden" name="idProp" value="employee" />
                  <button type="submit" className="btn btn--grey">
                    <div className="btn__inner">{employee.name}</div>
                  </button>
                </employeeFetcher.Form>
              )}
            </li>
          );
        })}
      </ul>
=======
        {providers.map((provider) => (
          <li key={provider.id}>
            {provider.name}
            <Link to={`/provider/${provider.id}/edit`}>Modificar</Link>
            <fetcher.Form
              method="post"
              action={`/provider/${provider.id}/deactivate`}
              onSubmit={(e) => {
                if (!confirm("¿Seguro que desea eliminar este proveedor?")) {
                  e.preventDefault();
                }
              }}
              style={{ display: "inline" }}
            >
              <button type="submit">Eliminar</button>
              {fetcher.data?.error && (
                <p style={{ color: "red" }}>{fetcher.data.error}</p>
              )}
            </fetcher.Form>
          </li>
        ))}
      </ul>
      <h2>Cuentas</h2>
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
<<<<<<< HEAD
  let message = "Ocurrió un error al cargar la venta";
=======
  let message = "Ocurrió un error al cargar el proveedor";
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
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
