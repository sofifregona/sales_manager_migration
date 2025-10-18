import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { ProviderDTO } from "~/feature/provider/provider";

type Props = {
  isEditing: boolean;
  editing?: ProviderDTO | null;
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function ProviderForm({
  isEditing,
  editing,
  isSubmitting,
  formAction,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [cuit, setCuit] = useState(
    editing?.cuit
      ? `${editing?.cuit.toString().slice(0, 2)}-${editing?.cuit
          .toString()
          .slice(2, 10)}-${editing?.cuit.toString().slice(10)}`
      : ""
  );
  const [telephone, setTelephone] = useState(editing?.telephone ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name ?? "");
      setCuit(
        editing?.cuit
          ? `${editing?.cuit.toString().slice(0, 2)}-${editing?.cuit
              .toString()
              .slice(2, 10)}-${editing?.cuit.toString().slice(10)}`
          : ""
      );
      setTelephone(editing?.telephone ?? "");
      setEmail(editing?.email ?? "");
      setAddress(editing?.address ?? "");
    } else if (!isEditing) {
      setName("");
      setCuit("");
      setTelephone("");
      setEmail("");
      setAddress("");
    }
  }, [isEditing, editing]);

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = raw;
    if (raw.length > 2 && raw.length <= 10)
      formatted = `${raw.slice(0, 2)}-${raw.slice(2)}`;
    if (raw.length > 10) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 10)}-${raw.slice(10)}`;
    }
    setCuit(formatted);
  };

  return (
    <Form method="post" action={formAction} className="provider-form">
      <label htmlFor="name">Nombre *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        aria-required
      />

      <label htmlFor="cuit">CUIT</label>
      <input
        id="cuit"
        name="cuit"
        value={cuit}
        onChange={handleCuitChange}
        maxLength={13}
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
        pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
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
