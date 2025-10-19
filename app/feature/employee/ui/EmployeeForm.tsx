import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { EmployeeDTO } from "~/feature/employee/employee";

type Props = {
  isEditing: boolean;
  editing?: EmployeeDTO | null;
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function EmployeeForm({
  isEditing,
  editing,
  isSubmitting,
  formAction,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [dni, setDni] = useState(editing?.dni ?? "");
  const [telephone, setTelephone] = useState(editing?.telephone ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name ?? "");
      setDni(editing?.dni ?? "");
      setTelephone(editing?.telephone ?? "");
      setEmail(editing?.email ?? "");
      setAddress(editing?.address ?? "");
    } else {
      setName("");
      setDni("");
      setTelephone("");
      setEmail("");
      setAddress("");
    }
  }, [isEditing, editing]);

  return (
    <Form method="post" action={formAction} className="employee-form">
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

      <label htmlFor="dni">DNI</label>
      <input
        id="dni"
        name="dni"
        type="number"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
        maxLength={8}
      />

      <label htmlFor="telephone">Telefono</label>
      <input
        id="telephone"
        name="telephone"
        type="tel"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        pattern="\d{6,13}"
      />

      <label htmlFor="email">E-mail</label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        // pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
      />

      <label htmlFor="address">Domicilio</label>
      <input
        id="address"
        name="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
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
