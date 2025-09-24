import {
  useLoaderData,
  useFetcher,
  Link,
  Form,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Category } from "~/types/category";
import { categoryListLoader } from "~/loaders/categoryLoader";
export { categoryListLoader as loader };

export default function CategoryListPage() {
  const categories = useLoaderData() as Category[];
  const fetcher = useFetcher();

  return (
    <div>
      <h1>Mesas</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <Link to={`/category/${category.id}/edit`}>Modificar</Link>
            <fetcher.Form
              method="post"
              action={`/category/${category.id}/deactivate`}
              onSubmit={(e) => {
                if (!confirm("¿Seguro que desea eliminar esta categoría?")) {
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
  let message = "Ocurrió un error al cargar la lista de categorías";
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
