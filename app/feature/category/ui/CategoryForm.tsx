import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { CategoryDTO } from "~/feature/category/category";

type Props = {
  isEditing: boolean;
  editing?: CategoryDTO | null;
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function CategoryForm({
  isEditing,
  editing,
  isSubmitting,
  formAction,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name ?? "");
    } else {
      setName("");
    }
  }, [isEditing, editing]);

  return (
    <Form method="post" action={formAction} className="category-form">
      <label htmlFor="name">Nombre *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => setName(e.target.value.replace(/\s+/g, " ").trim())}
        maxLength={80}
        minLength={5}
        required
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
