import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { UserDTO } from "~/feature/user/user";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  action: "update" | "reset-password" | "create";
  editing?: UserDTO | null;
  formAction: string;
  cancelHref: string;
  onCancel?: () => void;
  actionError?: string;
};

export function UserForm({
  action,
  editing,
  formAction,
  cancelHref: _cancelHref,
  onCancel,
  actionError,
}: Props) {
  const [username, setUsername] = useState(editing?.username ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [role, setRole] = useState(editing?.role ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  const handleInvalid = (e: React.FormEvent<HTMLInputElement>) => {
    console.log(e.currentTarget);
    console.log(e.currentTarget.validity);
  };

  useEffect(() => {
    if (action !== "create") {
      setUsername(editing?.username ?? "");
      setName(editing?.name ?? "");
      setRole(editing?.role ?? "");
    }
  }, [action, editing]);

  const p = new URLSearchParams(location.search);
  const successFlags = [
    "created",
    "updated",
    "deactivated",
    "reactivated",
    "reseted-password",
  ];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess && action === "create") {
      setUsername("");
      setName("");
      setRole("");
      setShowPassword(false);
      setShowRepeatPassword(false);
    }
  }, [location.search, hasSuccess, action]);

  return (
    <Form method="post" action={formAction} className="form user-form">
      <div className="form-input__div">
        <div className="form-pill pill-username-user">
          <label
            htmlFor="username"
            className="form-pill__label label-username-user"
          >
            Usuario *
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            minLength={5}
            maxLength={32}
            disabled={action === "reset-password"}
            onChange={(e) => setUsername(e.target.value)}
            pattern={
              "^(?=.{5,32}$)(?!.*[._-]{2})[a-z0-9](?:[a-z0-9._-]*[a-z0-9])$"
            }
            required={action !== "reset-password"}
            className="form-pill__input input-username-user"
          />
        </div>

        <div className="form-pill pill-name-user">
          <label htmlFor="name" className="form-pill__label label-name-user">
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={(e) => setName(e.target.value.replace(/\s+/g, " ").trim())}
            minLength={5}
            maxLength={80}
            disabled={action === "reset-password"}
            required={action !== "reset-password"}
            className="form-pill__input input-name-user"
          />
        </div>

        <div className="form-pill pill-password-user">
          <label
            htmlFor="password"
            className="form-pill__label label-password-user"
          >
            Contraseña *
          </label>
          <div className="password__input-container">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={action === "update"}
              minLength={8}
              maxLength={80}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]+$"
              required={action !== "update"}
              className="form-pill__input input-password-user"
              onInvalid={handleInvalid}
            />
            {action !== "update" && (
              <div
                className="password-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-controls="password"
              >
                {showPassword ? (
                  <FaEyeSlash className="password-icon password-icon--show" />
                ) : (
                  <FaEye className="password-icon password-icon--hide" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-pill pill-repeat-password-user">
          <label
            htmlFor="repetedPassword"
            className="form-pill__label label-repeat-password-user"
          >
            Repetir contraseña *
          </label>
          <div className="repeat-password__input-container">
            <input
              id="repetedPassword"
              name="repetedPassword"
              type={showRepeatPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={action === "update"}
              minLength={8}
              maxLength={80}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]+$"
              required={action !== "update"}
              className="form-pill__input input-repeat-password-user"
            />
            {action !== "update" && (
              <div
                className="password-btn"
                onClick={() => setShowRepeatPassword((v) => !v)}
                aria-pressed={showRepeatPassword}
                aria-controls="repetedPassword"
              >
                {showRepeatPassword ? (
                  <FaEyeSlash className="password-icon password-icon--show" />
                ) : (
                  <FaEye className="password-icon password-icon--hide" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-pill pill-role-user">
          <label htmlFor="role" className="form-pill__label label-role-user">
            Rol *
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={action === "reset-password"}
            required={action !== "reset-password"}
            className="form-pill__input input-role-user"
          >
            <option value="" disabled>
              Selecciona un rol
            </option>
            <option key={`opt_role_CASHIER`} value="CASHIER">
              CAJERO
            </option>
            <option key={`opt_role_MANAGER`} value="MANAGER">
              MANAGER
            </option>
            <option key={`opt_role_ADMIN`} value="ADMIN">
              ADMINISTRADOR
            </option>
          </select>
        </div>
        <input type="hidden" name="_action" value={action} />
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
