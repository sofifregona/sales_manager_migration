import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { AccountDTO } from "~/feature/account/account";
import type { TransactionDTO } from "~/feature/transaction/transaction";
import { formatDateTime } from "~/utils/formatters/formatDateTime";

type Props = {
  isEditing: boolean;
  editing?: TransactionDTO | null;
  accounts: AccountDTO[];
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function MovementForm({
  isEditing,
  editing,
  accounts,
  isSubmitting,
  formAction,
}: Props) {
  const today = formatDateTime(new Date(), "yyyy-mm-dd");
  const dateTime = editing
    ? formatDateTime(editing?.dateTime, "dd-mm-yyyy hh:mm:ss").split(" ")
    : today;
  const [idAccount, setIdAccount] = useState(editing?.account.id ?? "");
  const [type, setType] = useState(editing?.type ?? "income");
  const [amount, setAmount] = useState(editing?.amount ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");

  useEffect(() => {
    if (isEditing) {
      setIdAccount(editing?.account.id ?? "");
      setType(editing?.type ?? "income");
      setAmount(editing?.amount ?? "");
      setDescription(editing?.description ?? "");
    } else {
      setIdAccount("");
      setType("income");
      setAmount("");
      setDescription("");
    }
  }, [isEditing, editing]);

  return (
    <Form method="post" action={formAction} className="transaction-form">
      <label htmlFor="idAccount">Cuenta *</label>
      <select
        id="idAccount"
        name="idAccount"
        value={idAccount}
        onChange={(e) => setIdAccount(e.target.value)}
        required
      >
        <option value="" disabled>
          - Selecciona una cuenta -
        </option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>

      <span>Tipo de operacion *</span>
      <div
        role="radiogroup"
        aria-required="true"
        className="inline-flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <button
          type="button"
          role="radio"
          aria-checked={type === "income"}
          onClick={() => setType("income")}
        >
          Ingreso
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={type === "expense"}
          onClick={() => setType("expense")}
        >
          Extraccion
        </button>
      </div>
      <input name="type" type="hidden" value={type} required />

      <label htmlFor="amount">Monto</label>
      <input
        id="amount"
        name="amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        step="0.01"
        min="0"
        required
        title="Campo obligatorio"
      />

      <label htmlFor="description">Descripción</label>
      <input
        id="description"
        name="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
    </Form>
  );
}
