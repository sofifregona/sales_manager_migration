import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Category } from "~/types/category";
import { categoryLoader } from "~/loaders/categoryLoader";
import { updateCategoryAction } from "~/actions/category/updateCategory";

export { categoryLoader as loader };
export { updateCategoryAction as action };

export default function CategoryEditPage() {
  const category = useLoaderData() as Category;

  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  return (
    <Form method="post">
      <label>Nombre de la categoría:</label>
      <input type="string" name="name" defaultValue={category.name} required />
      <button type="submit">Guardar cambios</button>
      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la categoría";
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
