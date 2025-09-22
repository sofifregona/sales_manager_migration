import { Form, useActionData } from "react-router-dom";
import { createBartableAction } from "~/actions/bartable/createBartableAction";

export const action = createBartableAction;

export default function CreateBartablePage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };
  return (
    <Form method="post">
      <label>Número de mesa: </label>
      <input name="number" type="number" min={0} step={1} required />
      <button type="submit">Crear mesa</button>
      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}
