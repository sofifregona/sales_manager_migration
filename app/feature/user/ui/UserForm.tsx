import React, { useEffect, useState } from "react";
import { Form, useSearchParams } from "react-router-dom";
import type { UserDTO } from "~/feature/user/user";

type Props = {
  isEditing: boolean;
  resetPassword: boolean;
  editing?: UserDTO | null;
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function UserForm({
  isEditing,
  resetPassword,
  editing,
  isSubmitting,
  formAction,
}: Props) {
  const [username, setUsername] = useState(editing?.username ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [role, setRole] = useState(editing?.role ?? "");

  useEffect(() => {
    if (isEditing) {
      setUsername(editing?.username ?? "");
    } else if (!isEditing) {
      setUsername("");
    }
  }, [isEditing, editing]);

  return (
    <Form method="post" action={formAction} className="user-form">
      <label htmlFor="name">Nombre de usuario *</label>
      <input
        id="username"
        name="username"
        type="text"
        value={username}
        minLength={3}
        maxLength={32}
        disabled={resetPassword}
        onChange={(e) => setUsername(e.target.value)}
        pattern={"^(?!.*[._-]{2})a-z0-9?$"}
        required={!resetPassword}
      />

      <label htmlFor="name">Nombre *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) =>
          setName(e.target.value.replace(/\s+/g, "").toLowerCase())
        }
        minLength={3}
        maxLength={80}
        disabled={resetPassword}
        required={!resetPassword}
      />

      <label htmlFor="password">Password *</label>
      <input
        id="password"
        name="password"
        type="password"
        disabled={!resetPassword}
        minLength={8}
        maxLength={128}
        pattern="^[\x20-\x7E]{12,128}$"
        required={resetPassword || !isEditing}
      />

      <label htmlFor="role">Rol *</label>
      <select
        id="role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={resetPassword}
        required
      >
        <option value="" disabled>
          — Selecciona un rol —
        </option>
        <option key={`opt_role_CASHIER`} value="CASHIER">
          CAJERO
        </option>
        <option key={`opt_role_MANAGER`} value="MANAGER">
          MANAGER
        </option>
        <option key={`opt_role_ADMIN`} value="ADMIN">
          ADMIN
        </option>
      </select>

      <input
        type="hidden"
        name="_action"
        value={
          !isEditing ? "create" : resetPassword ? "resetPassword" : "update"
        }
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>

      <p className="hint">(*) Campos obligatorios.</p>
    </Form>
  );
}
