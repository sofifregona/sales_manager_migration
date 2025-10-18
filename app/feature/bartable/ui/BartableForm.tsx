import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { BartableDTO } from "~/feature/bartable/bartable";

type Props = {
  isEditing: boolean;
  editing?: BartableDTO | null;
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function BartableForm({
  isEditing,
  editing,
  isSubmitting,
  formAction,
}: Props) {
  const [number, setNumber] = useState(editing?.number ?? "");

  useEffect(() => {
    if (isEditing) {
      setNumber(editing?.number ?? "");
    } else {
      setNumber("");
    }
  }, [isEditing, editing]);

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
        max={1}
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
