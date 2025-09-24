import { Form, useActionData } from "react-router-dom";
import { createBrandAction } from "~/actions/brand/createBrandAction";

export const action = createBrandAction;

export default function CreateBrandPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };
  return (
    <Form method="post">
      <label>Nombre de la marca: </label>
      <input name="name" type="string" required />
      <button type="submit">Crear marca</button>
      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}
