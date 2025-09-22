import {
  useLoaderData,
  useFetcher,
  Link,
  Form,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Bartable } from "~/types/bartable";
import { bartableListLoader } from "~/loaders/bartableLoader";
export { bartableListLoader as loader };

export default function BartableListPage() {
  const bartables = useLoaderData() as Bartable[];
  const fetcher = useFetcher();

  return (
    <div>
      <h1>Mesas</h1>
      <ul>
        {bartables.map((bartable) => (
          <li key={bartable.id}>
            Mesa #{bartable.number}
            <Link to={`/bartable/${bartable.id}/edit`}>Modificar</Link>
            <fetcher.Form
              method="post"
              action={`/bartable/${bartable.id}/deactivate`}
              onSubmit={(e) => {
                if (!confirm("¿Seguro que desea eliminar esta mesa?")) {
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
  let message = "Ocurrió un error al cargar la lista de mesas";
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
