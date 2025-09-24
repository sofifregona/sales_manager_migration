import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Bartable } from "~/types/bartable";
import { bartableLoader } from "~/loaders/bartableLoader";
import { updateBartableAction } from "~/actions/bartable/updateBartableAction";

export { bartableLoader as loader };
export { updateBartableAction as action };

export default function BartableEditPage() {
  const bartable = useLoaderData() as Bartable;
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  return (
    <Form method="post">
      <label>Número de mesa:</label>
      <input
        type="number"
        name="number"
        defaultValue={bartable.number}
        required
      />
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
  let message = "Ocurrió un error al cargar la mesa";
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
