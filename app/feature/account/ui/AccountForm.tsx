import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";

type Props = {
  isEditing: boolean;
  editing?: AccountDTO | null;
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function AccountForm({
  isEditing,
  editing,
  isSubmitting,
  formAction,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name ?? "");
      setDescription(editing?.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [isEditing, editing]);

  return (
    <Form method="post" action={formAction} className="account-form">
      <label htmlFor="name">Nombre *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => setName(e.target.value.replace(/\s+/g, " ").trim())}
        maxLength={80}
        minLength={8}
        required
      />

      <label htmlFor="description">Descripcion</label>
      <input
        id="description"
        name="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="hidden"
        name="_action"
        value={isEditing ? "update" : "create"}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>

      <p className="hint">(*) Campos obligatorios.</p>
    </Form>
  );
}
