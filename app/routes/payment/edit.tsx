import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Payment } from "~/types/payment";
import { paymentLoader } from "~/loaders/paymentLoader";
import { updatePaymentAction } from "~/actions/payment/updatePayment";

export { paymentLoader as loader };
export { updatePaymentAction as action };

export default function PaymentEditPage() {
  const payment = useLoaderData() as Payment;
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  return (
    <Form method="post">
      <label>Nombre del método de pago:</label>
      <input type="string" name="name" defaultValue={payment.name} required />
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
  let message = "Ocurrió un error al cargar el método de pago";
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
