import React, { useEffect, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { BartableDTO } from "~/feature/bartable/bartable";

type Props = {
  isEditing: boolean;
  editing?: BartableDTO | null;
  formAction: string; // "." o `.${search}`
  overrideNumber: string | undefined;
};

export function BartableForm({
  isEditing,
  editing,
  formAction,
  overrideNumber,
}: Props) {
  const [number, setNumber] = useState(editing?.number ?? "");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setNumber(overrideNumber ?? editing?.number ?? "");
    }
    // En modo creación, no limpiamos los campos para no perder lo tipeado
  }, [isEditing, editing, overrideNumber]);

  // En conflictos de creación, preseleccionar número desde cookie si viene
  useEffect(() => {
    if (
      !isEditing &&
      typeof overrideNumber === "string" &&
      overrideNumber !== ""
    ) {
      setNumber(overrideNumber);
    }
  }, [isEditing, overrideNumber]);

  // Luego de crear con éxito (?created=1 en la URL), limpiar el formulario de creación
  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deactivated", "reactivated"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setNumber("");
    }
  }, [location.search, isEditing]);

  return (
    <Form method="post" action={formAction} className="bartable-form">
      <label htmlFor="name">Número *</label>
      <input
        id="number"
        name="number"
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        min={0}
        step={1}
        required
        aria-required
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
