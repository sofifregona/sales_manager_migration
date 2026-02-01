import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { ProviderDTO } from "~/feature/provider/provider";

type Props = {
  isEditing: boolean;
  editing?: ProviderDTO | null;
  formAction: string;
  cancelHref: string;
  onCancel?: () => void;
  actionError?: string;
};

const formatCuit = (value: number | string | null | undefined) => {
  if (value == null) return "";
  const digits = value.toString();
  const clean = digits.replace(/\D/g, "");
  if (clean.length <= 2) return clean;
  if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10, 11)}`;
};

export function ProviderForm({
  isEditing,
  editing,
  formAction,
  cancelHref: _cancelHref,
  onCancel,
  actionError,
}: Props) {
  void _cancelHref;
  const [name, setName] = useState(editing?.name ?? "");
  const [cuit, setCuit] = useState(formatCuit(editing?.cuit ?? null));
  const [telephone, setTelephone] = useState(editing?.telephone?.toString() ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name ?? "");
      setCuit(formatCuit(editing?.cuit ?? null));
      setTelephone(editing?.telephone?.toString() ?? "");
      setEmail(editing?.email ?? "");
      setAddress(editing?.address ?? "");
    }
  }, [isEditing, editing]);

  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deactivated", "reactivated"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess && !isEditing) {
      setName("");
      setCuit("");
      setTelephone("");
      setEmail("");
      setAddress("");
    }
  }, [location.search, hasSuccess, isEditing]);

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = raw;
    if (raw.length > 2 && raw.length <= 10) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2)}`;
    }
    if (raw.length > 10) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 10)}-${raw.slice(10, 11)}`;
    }
    setCuit(formatted);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isEditing && editing) {
      const trimmedName = (name || "").replace(/\s+/g, " ").trim();
      const originalName = (editing.name || "").replace(/\s+/g, " ").trim();
      const digits = cuit.replace(/\D/g, "");
      const originalDigits = editing.cuit?.toString() ?? "";
      const telephoneValue = (telephone || "").trim();
      const originalTelephone = editing.telephone?.toString() ?? "";
      const emailValue = (email || "").trim();
      const originalEmail = editing.email ?? "";
      const addressValue = (address || "").trim();
      const originalAddress = editing.address ?? "";

      const hasChanges =
        trimmedName !== originalName ||
        digits !== originalDigits ||
        telephoneValue !== originalTelephone ||
        emailValue !== originalEmail ||
        addressValue !== originalAddress;

      if (!hasChanges) {
        event.preventDefault();
        onCancel?.();
      }
    }
  };

  return (
    <Form
      method="post"
      action={formAction}
      className="form provider-form"
      onSubmit={handleSubmit}
    >
      <div className="form-input__div">
        <div className="form-pill pill-name-provider">
          <label htmlFor="name" className="form-pill__label label-name-provider">
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={(e) =>
              setName((e.target.value ?? "").replace(/\s+/g, " ").trim())
            }
            maxLength={80}
            minLength={8}
            required
            className="form-pill__input input-name-provider"
          />
        </div>

        <div className="form-pill pill-cuit-provider">
          <label htmlFor="cuit" className="form-pill__label label-cuit-provider">
            CUIT
          </label>
          <input
            id="cuit"
            name="cuit"
            value={cuit}
            onChange={handleCuitChange}
            maxLength={13}
            className="form-pill__input input-cuit-provider"
          />
        </div>

        <div className="form-pill pill-telephone-provider">
          <label
            htmlFor="telephone"
            className="form-pill__label label-telephone-provider"
          >
            Teléfono
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            pattern="\d{6,13}"
            className="form-pill__input input-telephone-provider"
          />
        </div>

        <div className="form-pill pill-email-provider">
          <label htmlFor="email" className="form-pill__label label-email-provider">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-pill__input input-email-provider"
          />
        </div>

        <div className="form-pill pill-address-provider">
          <label
            htmlFor="address"
            className="form-pill__label label-address-provider"
          >
            Domicilio
          </label>
          <input
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-pill__input input-address-provider"
          />
        </div>

        <input
          type="hidden"
          name="_action"
          value={isEditing ? "update" : "create"}
        />
      </div>

      {actionError && (
        <div className="inline-error form-inline-error" role="alert">
          {actionError}
        </div>
      )}

      <div className="form-btns">
        <p className="form-pill__hint">(*) Campos obligatorios.</p>
        <div className="form-btns__div">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="secondary-btn form-btns__btn form-btns__btn-cancel"
          >
            Cancelar
          </button>
          <button
            className="btn form-btns__btn form-btns__btn-save"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <FaSpinner className="action-icon spinner" />
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </Form>
  );
}
