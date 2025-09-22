import { Form, useActionData } from "react-router-dom";
import { createPaymentAction } from "~/actions/payment/createPayment";

export const action = createPaymentAction;

export default function CreatePaymentPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };
  return (
    <Form method="post">
      <label>Nombre del método de pago: </label>
      <input name="name" type="string" required />
      <button type="submit">Crear método de pago</button>
      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}
