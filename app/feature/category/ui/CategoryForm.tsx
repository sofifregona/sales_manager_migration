import React, { useEffect, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { CategoryDTO } from "~/feature/category/category";

type Props = {
  isEditing: boolean;
  editing?: CategoryDTO | null;
  formAction: string; // "." o `.${search}`
  overrideName?: string | undefined;
};

export function CategoryForm({
  isEditing,
  editing,
  formAction,
  overrideName,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setName(overrideName ?? editing?.name ?? "");
    }
  }, [isEditing, editing, overrideName]);

  // En conflictos de creación, prellenar desde cookie si viene
  useEffect(() => {
    if (!isEditing && typeof overrideName === "string" && overrideName !== "") {
      setName(overrideName);
    }
  }, [isEditing, overrideName]);
  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deactivated", "reactivated"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setName("");
    }
  }, [location.search, isEditing]);

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
