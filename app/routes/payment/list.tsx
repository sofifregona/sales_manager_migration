import { useLoaderData, useFetcher, Link } from "react-router-dom";
import type { Payment } from "~/types/payment";
import { paymentListLoader } from "~/loaders/paymentLoader";
export { paymentListLoader as loader };

export default function PaymentListPage() {
  const payments = useLoaderData() as Payment[];
  const fetcher = useFetcher();

  return (
    <div>
      <h1>Mesas</h1>
      <ul>
        {payments.map((payment) => (
          <li key={payment.id}>
            {payment.name}
            <Link to={`/payment/${payment.id}/edit`}>Modificar</Link>
            <fetcher.Form
              method="post"
              action={`/payment/${payment.id}/deactivate`}
              onSubmit={(e) => {
                if (
                  !confirm("¿Seguro que desea eliminar este método de pago?")
                ) {
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
