import {
  useLoaderData,
  useFetcher,
  Link,
  Form,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Brand } from "~/types/brand";
import { brandListLoader } from "~/loaders/brandLoader";
export { brandListLoader as loader };

export default function BrandListPage() {
  const brands = useLoaderData() as Brand[];
  const fetcher = useFetcher();

  return (
    <div>
      <h1>Mesas</h1>
      <ul>
        {brands.map((brand) => (
          <li key={brand.id}>
            {brand.name}
            <Link to={`/brand/${brand.id}/edit`}>Modificar</Link>
            <fetcher.Form
              method="post"
              action={`/brand/${brand.id}/deactivate`}
              onSubmit={(e) => {
                if (!confirm("¿Seguro que desea eliminar esta marca?")) {
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
  let message = "Ocurrió un error al cargar la lista de marcas";
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
