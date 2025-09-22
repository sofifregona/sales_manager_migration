import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Provider } from "~/types/provider";
import { providerLoader } from "~/loaders/providerLoader";
import { updateProviderAction } from "~/actions/provider/updateProvider";
import { useState } from "react";

export { providerLoader as loader };
export { updateProviderAction as action };

export default function ProviderEditPage() {
  const provider = useLoaderData() as Provider;
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const [cuit, setCuit] = useState(
    provider.cuit
      ? `${provider.cuit.toString().slice(0, 2)}-${provider.cuit
          .toString()
          .slice(2, 10)}-${provider.cuit.toString().slice(10)}`
      : ""
  );

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = raw;
    if (raw.length > 2 && raw.length <= 10)
      formatted = `${raw.slice(0, 2)}-${raw.slice(2)}`;
    if (raw.length > 10) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 10)}-${raw.slice(10)}`;
    }

    setCuit(formatted);
  };

  return (
    <Form method="post">
      <label>Nombre del proveedor:</label>
      <input type="string" name="name" defaultValue={provider.name} required />
      <label>CUIT:</label>
      <input
        name="cuit"
        type="text"
        value={cuit}
        onChange={handleCuitChange}
        maxLength={13}
        placeholder="Ej: 00-00000000-0"
      />
      <label>Teléfono:</label>
      <input
        name="telephone"
        type="tel"
        pattern="\d{6,13}"
        placeholder="Ej: 3421234567"
        title="El campo debe tener entre 6 y 13 dígitos numéricos."
        defaultValue={provider.telephone?.toString()}
      />

      <label>Email:</label>
      <input
        name="email"
        type="email"
        maxLength={100}
        pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        placeholder="Ej: proveedor@gmail.com"
        title="Ingrese un correo válido."
        defaultValue={provider.email?.toString()}
      />

      <label>Dirección:</label>
      <input
        name="address"
        type="text"
        maxLength={255}
        defaultValue={provider.address?.toString()}
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
