import { Form, useActionData } from "react-router-dom";
import { createCategoryAction } from "~/actions/category/createCategory";

export const action = createCategoryAction;

export default function CreateCategoryPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };
  return (
    <Form method="post">
      <label>Nombre de la categoría: </label>
      <input name="name" type="string" required />
      <button type="submit">Crear categoría</button>
      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}
