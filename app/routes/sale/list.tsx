import {
  useLoaderData,
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

  return (
    <div>
      <h1>Ventas</h1>
      <h2>Mesas</h2>
      <ul>
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
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar el proveedor";
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
