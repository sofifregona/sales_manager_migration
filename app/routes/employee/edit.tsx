import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Employee } from "~/types/employee";
import { employeeLoader } from "~/loaders/employeeLoader";
import { updateEmployeeAction } from "~/actions/employee/updateEmployee";
import { useState } from "react";

export { employeeLoader as loader };
export { updateEmployeeAction as action };

export default function EmployeeEditPage() {
  const employee = useLoaderData() as Employee;
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const [dni, setDni] = useState(
    employee.dni
      ? `${employee.dni.toString().slice(0, 2)}.${employee.dni
          .toString()
          .slice(2, 5)}.${employee.dni.toString().slice(5)}`
      : ""
  );

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
      <label>Nombre del proveedor:</label>
      <input type="string" name="name" defaultValue={employee.name} required />
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
        defaultValue={employee.telephone?.toString()}
      />

      <label>Email:</label>
      <input
        name="email"
        type="email"
        maxLength={100}
        pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        placeholder="Ej: proveedor@gmail.com"
        title="Ingrese un correo válido."
        defaultValue={employee.email?.toString()}
      />

      <label>Dirección:</label>
      <input
        name="address"
        type="text"
        maxLength={255}
        defaultValue={employee.address?.toString()}
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
