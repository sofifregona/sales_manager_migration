import { useState } from "react";
import { Form, useActionData } from "react-router-dom";
import { createEmployeeAction } from "~/actions/employee/createEmployee";

export const action = createEmployeeAction;

export default function CreateEmployeePage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const [dni, setDni] = useState("");

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = raw;
    if (raw.length > 2 && raw.length <= 5)
      formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
    }

    setDni(formatted);
  };

  return (
    <Form method="post">
      <label>Nombre del empleado: </label>
      <input name="name" type="text" required />

      <label>DNI:</label>
      <input
        name="dni"
        type="text"
        value={dni}
        onChange={handleDniChange}
        maxLength={10}
        placeholder="Ej: 00.000.000"
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

<<<<<<< HEAD
      <button type="submit">Crear empleado</button>
=======
      <button type="submit">Crear proveedor</button>
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87

      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}
