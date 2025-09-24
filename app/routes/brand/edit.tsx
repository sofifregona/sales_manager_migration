import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Brand } from "~/types/brand";
import { brandLoader } from "~/loaders/brandLoader";
import { updateBrandAction } from "~/actions/brand/updateBrandAction";

export { brandLoader as loader };
export { updateBrandAction as action };

export default function BrandEditPage() {
  const brand = useLoaderData() as Brand;

  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  return (
    <Form method="post">
      <label>Nombre de la marca:</label>
      <input type="string" name="name" defaultValue={brand.name} required />
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
  let message = "Ocurrió un error al cargar la marca";
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
