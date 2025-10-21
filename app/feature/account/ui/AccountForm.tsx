import React, { useEffect, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";

type Props = {
  isEditing: boolean;
  editing?: AccountDTO | null;
  formAction: string; // "." o `.${search}`
  overrideName: string | undefined;
};

export function AccountForm({
  isEditing,
  editing,
  formAction,
  overrideName,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();
  console.log("DENTRO DEL ACCOUNT FORM");
  console.log(overrideName);

  useEffect(() => {
    if (isEditing) {
      setName(overrideName ?? editing?.name ?? "");
      setDescription(editing?.description ?? "");
    }
    // En modo creación, no limpiamos los campos para no perder lo tipeado
  }, [isEditing, editing]);

  // Luego de crear con éxito (?created=1 en la URL), limpiar el formulario de creación
  useEffect(() => {
    if (!isEditing) {
      const p = new URLSearchParams(location.search);
      if (p.get("created") === "1") {
        setName("");
        setDescription("");
      }
    }
  }, [location.search, isEditing]);

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

      <label htmlFor="description">Descripción</label>
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
