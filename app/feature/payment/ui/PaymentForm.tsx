import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";
import type { PaymentDTO } from "~/feature/payment/payment";

type Props = {
  isEditing: boolean;
  editing?: PaymentDTO | null;
  accounts: AccountDTO[];
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function PaymentForm({
  isEditing,
  editing,
  accounts,
  isSubmitting,
  formAction,
}: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [idAccount, setIdAccount] = useState(editing?.account.id ?? "");

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name ?? "");
      setIdAccount(editing?.account.id ?? "");
    } else {
      setName("");
      setIdAccount("");
    }
  }, [isEditing, editing]);

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
          - Seleccion una cuenta -
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
