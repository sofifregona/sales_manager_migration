import React, { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import type { ProviderDTO } from "~/feature/provider/provider";

type Props = {
  isEditing: boolean;
  editing?: ProviderDTO | null;
  formAction: string; // "." o `.${search}`
};

export function ProviderForm({ isEditing, editing, formAction }: Props) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const originalRef = useRef<ProviderDTO | null>(editing ?? null);
  const [name, setName] = useState<string>(editing?.name ?? "");
  const [cuit, setCuit] = useState<string>(
    editing?.cuit
      ? `${editing?.cuit.toString().slice(0, 2)}-${editing?.cuit
          .toString()
          .slice(2, 10)}-${editing?.cuit.toString().slice(10)}`
      : ""
  );
  const [telephone, setTelephone] = useState<string>(
    editing?.telephone?.toString() ?? ""
  );
  const [email, setEmail] = useState<string>(editing?.email ?? "");
  const [address, setAddress] = useState<string>(editing?.address ?? "");

  useEffect(() => {
    originalRef.current = editing ?? null;
    if (isEditing) {
      setName(editing?.name ?? "");
      setCuit(
        editing?.cuit
          ? `${editing?.cuit.toString().slice(0, 2)}-${editing?.cuit
              .toString()
              .slice(2, 10)}-${editing?.cuit.toString().slice(10)}`
          : ""
      );
      setTelephone(editing?.telephone?.toString() ?? "");
      setEmail(editing?.email ?? "");
      setAddress(editing?.address ?? "");
    } else {
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    if (!isEditing) {
      const formData = new FormData(formElement);
      fetcher.submit(formData, { method: "post", action: formAction });
      return;
    }

    const original = originalRef.current;
    if (!original) return;

    const patch = new FormData();
    const trimmedName = name.replace(/\s+/g, " ").trim();
    const originalName = (original.name ?? "").replace(/\s+/g, " ").trim();
    let hasChanges = false;

    if (trimmedName !== originalName) {
      patch.append("name", trimmedName);
      hasChanges = true;
    }

    const digits = cuit.replace(/\D/g, "");
    const originalDigits = original.cuit?.toString() ?? "";
    if (digits !== originalDigits) {
      patch.append("cuit", cuit);
      hasChanges = true;
    }

    const telephoneValue = telephone;
    const originalTelephone = original.telephone?.toString() ?? "";
    if (telephoneValue !== originalTelephone) {
      patch.append("telephone", telephoneValue);
      hasChanges = true;
    }

    const emailValue = email.trim();
    const originalEmail = original.email ?? "";
    if (emailValue !== originalEmail) {
      patch.append("email", emailValue);
      hasChanges = true;
    }

    const addressValue = address.trim();
    const originalAddress = original.address ?? "";
    if (addressValue !== originalAddress) {
      patch.append("address", addressValue);
      hasChanges = true;
    }

    if (!hasChanges) {
      return;
    }

    patch.append("_action", "update");
    fetcher.submit(patch, { method: "post", action: formAction });
  };

  return (
    <fetcher.Form
      method="post"
      action={formAction}
      className="provider-form"
      onSubmit={handleSubmit}
    >
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
    </fetcher.Form>
  );
}
