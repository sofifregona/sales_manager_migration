import { useEffect, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";
import type { PaymentDTO } from "~/feature/payment/payment";

type Props = {
  isEditing: boolean;
  editing?: PaymentDTO | null;
  accounts: AccountDTO[];
  formAction: string; // "." o `.${search}`
  overrideName: string | undefined;
  overrideAccountId?: number | undefined;
};

export function PaymentForm({
  isEditing,
  editing,
  accounts,
  formAction,
  overrideName,
  overrideAccountId,
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
    // En modo creación, no limpiamos los campos para no perder lo tipeado
  }, [isEditing, editing, overrideName]);

  // En conflictos de creación, preseleccionar cuenta desde cookie si viene
  useEffect(() => {
    if (!isEditing && typeof overrideAccountId === "number") {
      setIdAccount(String(overrideAccountId));
    }
  }, [isEditing, overrideAccountId]);

  // Luego de crear con éxito (?created=1 en la URL), limpiar el formulario de creación
  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deactivated", "reactivated"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setName("");
      setIdAccount("");
    }
  }, [location.search, isEditing]);

  return (
    <Form method="post" action={formAction} className="payment-form">
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

      <select
        id="idAccount"
        name="idAccount"
        value={idAccount}
        onChange={(e) => setIdAccount(e.target.value)}
        required
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
