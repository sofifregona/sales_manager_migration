import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { EmployeeDTO } from "~/feature/employee/employee";

type Props = {
  isEditing: boolean;
  editing?: EmployeeDTO | null;
  formAction: string;
  cancelHref: string;
  onCancel?: () => void;
  actionError?: string;
};

export function EmployeeForm({
  isEditing,
  editing,
  formAction,
  cancelHref: _cancelHref,
  onCancel,
  actionError,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [dni, setDni] = useState(editing?.dni?.toString() ?? "");
  const [telephone, setTelephone] = useState(
    editing?.telephone?.toString() ?? ""
  );
  const [email, setEmail] = useState(editing?.email ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name ?? "");
      setDni(editing?.dni?.toString() ?? "");
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
      setDni("");
      setTelephone("");
      setEmail("");
      setAddress("");
    }
  }, [location.search, hasSuccess, isEditing]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isEditing && editing) {
      const trimmedName = (name || "").replace(/\s+/g, " ").trim();
      const originalName = (editing.name || "").replace(/\s+/g, " ").trim();
      const dniValue = (dni || "").trim();
      const originalDni = editing.dni?.toString() ?? "";
      const telephoneValue = (telephone || "").trim();
      const originalTelephone = editing.telephone?.toString() ?? "";
      const emailValue = (email || "").trim();
      const originalEmail = editing.email ?? "";
      const addressValue = (address || "").trim();
      const originalAddress = editing.address ?? "";

      const hasChanges =
        trimmedName !== originalName ||
        dniValue !== originalDni ||
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
      className="form employee-form"
      onSubmit={handleSubmit}
    >
      <div className="form-input__div">
        <div className="form-pill pill-name-employee">
          <label htmlFor="name" className="form-pill__label label-name-employee">
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
            minLength={5}
            required
            className="form-pill__input input-name-employee"
          />
        </div>

        <div className="form-pill pill-dni-employee">
          <label htmlFor="dni" className="form-pill__label label-dni-employee">
            DNI
          </label>
          <input
            id="dni"
            name="dni"
            type="number"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="form-pill__input input-dni-employee"
          />
        </div>

        <div className="form-pill pill-telephone-employee">
          <label
            htmlFor="telephone"
            className="form-pill__label label-telephone-employee"
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
            className="form-pill__input input-telephone-employee"
          />
        </div>

        <div className="form-pill pill-email-employee">
          <label htmlFor="email" className="form-pill__label label-email-employee">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-pill__input input-email-employee"
          />
        </div>

        <div className="form-pill pill-address-employee">
          <label
            htmlFor="address"
            className="form-pill__label label-address-employee"
          >
            Domicilio
          </label>
          <input
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-pill__input input-address-employee"
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
