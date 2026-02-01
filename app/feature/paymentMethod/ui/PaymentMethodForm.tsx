import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";
import type { PaymentMethodDTO } from "~/feature/paymentMethod/payment-method";

type Props = {
  isEditing: boolean;
  editing?: PaymentMethodDTO | null;
  accounts: AccountDTO[];
  formAction: string; // "." o `.${search}`
  overrideName: string | undefined;
  overrideAccountId?: number | undefined;
  onSubmitClose?: () => void;
  onCancel?: () => void;
};

export function PaymentMethodForm({
  isEditing,
  editing,
  accounts,
  formAction,
  overrideName,
  overrideAccountId,
  onSubmitClose,
  onCancel,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [idAccount, setIdAccount] = useState(editing?.account.id ?? "");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setName(overrideName ?? editing?.name ?? "");
      setIdAccount(editing?.account.id ?? "");
    }
  }, [isEditing, editing, overrideName]);

  useEffect(() => {
    if (!isEditing && typeof overrideAccountId === "number") {
      setIdAccount(String(overrideAccountId));
    }
  }, [isEditing, overrideAccountId]);

  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deactivated", "reactivated"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setName("");
      setIdAccount("");
    }
  }, [location.search, hasSuccess, isEditing]);

  const handleSubmit = () => {
    onSubmitClose?.();
  };

  return (
    <Form
      method="post"
      action={formAction}
      className="form payment-method-form"
      onSubmit={handleSubmit}
    >
      <div className="form-input__div">
        <div className="form-pill pill-name-payment-method">
          <label
            htmlFor="name"
            className="form-pill__label label-name-payment-method"
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
            minLength={5}
            required
            className="form-pill__input input-name-payment-method"
          />
        </div>

        <div className="form-pill pill-account-payment-method">
          <label
            htmlFor="idAccount"
            className="form-pill__label label-account-payment-method"
          >
            Cuenta*
          </label>
          <select
            id="idAccount"
            name="idAccount"
            value={idAccount}
            onChange={(e) => setIdAccount(e.target.value)}
            required
            className="form-pill__input select-account-payment-method"
          >
            <option value="" disabled>
              - Seleccione una cuenta -
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <input
          type="hidden"
          name="_action"
          value={isEditing ? "update" : "create"}
        />
      </div>

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
