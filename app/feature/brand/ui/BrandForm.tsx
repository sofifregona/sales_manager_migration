import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Form, Link, useLocation, useNavigation } from "react-router-dom";
import type { BrandDTO } from "~/feature/brand/brand";

type Props = {
  isEditing: boolean;
  editing?: BrandDTO | null;
  formAction: string; // "." o `.${search}`
  overrideName: string | undefined;
  cancelHref: string;
  onCancel?: () => void;
  actionError?: string;
};

export function BrandForm({
  isEditing,
  editing,
  formAction,
  overrideName,
  cancelHref,
  onCancel,
  actionError,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setName(overrideName ?? editing?.name ?? "");
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
    }
  }, [location.search, hasSuccess, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    if (isEditing && editing) {
      const originalName = (editing.name || "").trim();
      const currentName = (name || "").trim();
      if (originalName === currentName) {
        e.preventDefault();
        onCancel?.();
      }
    }
  };

  return (
    <Form
      method="post"
      action={formAction}
      className="form brand-form"
      onSubmit={handleSubmit}
    >
      <div className="form-input__div">
        <div className="form-pill pill-name-brand">
          <label
            htmlFor="name"
            className="form-pill__label label-name-brand"
          >
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
            minLength={3}
            required
            className="form-pill__input input-name-brand"
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
