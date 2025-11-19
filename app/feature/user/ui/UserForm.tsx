import { useEffect, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { UserDTO } from "~/feature/user/user";

type Props = {
  action: "update" | "reset-password" | "create";
  editing?: UserDTO | null;
  formAction: string; // "." o `.${search}`
};

export function UserForm({ action, editing, formAction }: Props) {
  const [username, setUsername] = useState(editing?.username ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [role, setRole] = useState(editing?.role ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (action !== "create") {
      setUsername(editing?.username ?? "");
      setName(editing?.name ?? "");
      setRole(editing?.role ?? "");
    }
  }, [action, editing]);

  return (
    <Form method="post" action={formAction} className="user-form">
      <label htmlFor="username">Nombre de usuario *</label>
      <input
        id="username"
        name="username"
        type="text"
        value={username}
        minLength={5}
        maxLength={32}
        disabled={action === "reset-password"}
        onChange={(e) => setUsername(e.target.value)}
        pattern={
          "^(?=.{5,32}$)(?!.*[._-]{2})[a-z0-9](?:[a-z0-9._-]*[a-z0-9])$"
        }
        required={action !== "reset-password"}
      />

      <label htmlFor="name">Nombre *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => setName(e.target.value.replace(/\s+/g, " ").trim())}
        minLength={5}
        maxLength={80}
        disabled={action === "reset-password"}
        required={action !== "reset-password"}
      />

      <label htmlFor="password">Contraseña *</label>
      <input
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        disabled={action === "update"}
        minLength={8}
        maxLength={80}
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])[^\\s]+$"
        required={action !== "update"}
      />
      {action !== "update" && (
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setShowPassword((v) => !v)}
          style={{ marginTop: 6, marginBottom: 12 }}
          aria-pressed={showPassword}
          aria-controls="password"
        >
          {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        </button>
      )}

      <label htmlFor="repetedPassword">Repetir contraseña *</label>
      <input
        id="repetedPassword"
        name="repetedPassword"
        type={showRepeatPassword ? "text" : "password"}
        autoComplete="new-password"
        disabled={action === "update"}
        minLength={8}
        maxLength={80}
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])[^\\s]+$"
        required={action !== "update"}
      />
      {action !== "update" && (
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setShowRepeatPassword((v) => !v)}
          style={{ marginTop: 6, marginBottom: 12 }}
          aria-pressed={showRepeatPassword}
          aria-controls="repetedPassword"
        >
          {showRepeatPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        </button>
      )}

      <label htmlFor="role">Rol *</label>
      <select
        id="role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={action === "reset-password"}
        required={action !== "reset-password"}
      >
        <option value="" disabled>
          Selecciona un rol
        </option>
        <option key={`opt_role_CASHIER`} value="CASHIER">
          CAJERO
        </option>
        <option key={`opt_role_MANAGER`} value="MANAGER">
          MANAGER
        </option>
        <option key={`opt_role_ADMIN`} value="ADMIN">
          ADMINISTRADOR
        </option>
      </select>

      <input type="hidden" name="_action" value={action} />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>

      <p className="hint">(*) Campos obligatorios.</p>
    </Form>
  );
}

