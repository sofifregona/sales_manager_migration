import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Form, Link, useLocation, useNavigation } from "react-router-dom";
import type { BartableDTO } from "~/feature/bartable/bartable";

type Props = {
  isEditing: boolean;
  editing?: BartableDTO | null;
  formAction: string; // "." o `.${search}`
  overrideNumber: string | undefined;
  cancelHref: string;
  onCancel?: () => void;
  actionError?: string;
};

export function BartableForm({
  isEditing,
  editing,
  formAction,
  overrideNumber,
  cancelHref,
  onCancel,
  actionError,
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

  useEffect(() => {
    if (
      !isEditing &&
      typeof overrideNumber === "string" &&
      overrideNumber !== ""
    ) {
      setNumber(overrideNumber);
    }
  }, [isEditing, overrideNumber]);

  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deactivated", "reactivated"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setNumber("");
    }
  }, [location.search, hasSuccess, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    if (isEditing && editing) {
      const original = String(editing.number);
      const current = String(number).trim();
      if (original === current) {
        e.preventDefault();
        onCancel?.();
        return;
      }
    }
  };

  return (
    <Form
      method="post"
      action={formAction}
      className="form bartable-form"
      onSubmit={handleSubmit}
    >
      <div className="form-input__div">
        <div className="form-pill pill-number-bartable">
          <label
            htmlFor="number"
            className="form-pill__label label-number-bartable"
          >
            Número*
          </label>
          <input
            id="number"
            name="number"
            type="number"
            value={number}
            autoComplete="off"
            onChange={(e) => setNumber(e.target.value)}
            min={0}
            step={1}
            required
            aria-required
            className="form-pill__input input-number-bartable"
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
