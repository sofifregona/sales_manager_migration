import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Form, Link, useLocation, useNavigation } from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";

type Props = {
  isEditing: boolean;
  editing?: AccountDTO | null;
  formAction: string; // "." o `.${search}`
  overrideName: string | undefined;
  cancelHref: string;
  onCancel?: () => void;
  actionError?: string;
};

export function AccountForm({
  isEditing,
  editing,
  formAction,
  overrideName,
  cancelHref,
  onCancel,
  actionError,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setName(overrideName ?? editing?.name ?? "");
      setDescription(editing?.description ?? "");
    }
    // En modo creación, no limpiamos los campos para no perder lo tipeado
  }, [isEditing, editing, overrideName]);

  // En conflictos de creación, prellenar desde cookie si viene
  useEffect(() => {
    if (!isEditing && typeof overrideName === "string" && overrideName !== "") {
      setName(overrideName);
    }
  }, [isEditing, overrideName]);

  // Luego de crear con éxito (?created=1 en la URL), limpiar el formulario de creación
  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deactivated", "reactivated"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setName("");
      setDescription("");
    }
  }, [location.search, hasSuccess, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    if (isEditing && editing) {
      const originalName = (editing.name || "").trim();
      const currentName = (name || "").trim();
      const originalDesc = (editing.description || "").trim();
      const currentDesc = (description || "").trim();
      if (originalName === currentName && originalDesc === currentDesc) {
        e.preventDefault();
        onCancel?.();
      }
    }
  };

  return (
    <Form
      method="post"
      action={formAction}
      className="form account-form"
      onSubmit={handleSubmit}
    >
      <div className="form-input__div">
        <div className="form-pill pill-name-account">
          <label htmlFor="name" className="form-pill__label label-name-account">
            Nombre*
          </label>
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
            className="form-pill__input input-name-account"
          />
        </div>

        <div className="form-pill pill-description-account">
          <label
            htmlFor="description"
            className="form-pill__label label-description-account"
          >
            Descripción
          </label>
          <input
            id="description"
            name="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-pill__input input-description-account"
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
