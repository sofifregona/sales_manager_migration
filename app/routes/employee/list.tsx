<<<<<<< HEAD
import { useLoaderData, useFetcher, Link } from "react-router-dom";
=======
import {
  useLoaderData,
  useFetcher,
  Link,
  Form,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
import type { Employee } from "~/types/employee";
import { employeeListLoader } from "~/loaders/employeeLoader";
export { employeeListLoader as loader };

export default function EmployeeListPage() {
  const employees = useLoaderData() as Employee[];
  const fetcher = useFetcher();

  return (
    <div>
<<<<<<< HEAD
      <h1>Empleados</h1>
=======
      <h1>Proveedores</h1>
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            {employee.name}
            <Link to={`/employee/${employee.id}/edit`}>Modificar</Link>
            <fetcher.Form
              method="post"
              action={`/employee/${employee.id}/deactivate`}
              onSubmit={(e) => {
                if (!confirm("¿Seguro que desea eliminar este empleado?")) {
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
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar el empleado";
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
