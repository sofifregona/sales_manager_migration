import { useState } from "react";
import { Form, useActionData } from "react-router-dom";
import { createProviderAction } from "~/actions/provider/createProvider";

export const action = createProviderAction;

export default function CreateProviderPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const [cuit, setCuit] = useState("");

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
      <label>Nombre del proveedor: </label>
      <input name="name" type="text" required />

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
      />

      <label>Email:</label>
      <input
        name="email"
        type="email"
        maxLength={100}
        pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        placeholder="Ej: proveedor@gmail.com"
        title="Ingrese un correo válido."
      />

      <label>Dirección:</label>
      <input name="address" type="text" maxLength={255} />

      <button type="submit">Crear proveedor</button>

      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}
