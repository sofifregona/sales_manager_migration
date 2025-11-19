import type { PaymentDTO } from "~/feature/payment/payment";

type Props = {
  payments: PaymentDTO[];
  idPayment: string;
  onPaymentChange: (value: string) => void;
  onRequestClose: () => void;
  disabled?: boolean;
};

export function SalePaymentForm({
  payments,
  idPayment,
  onPaymentChange,
  onRequestClose,
  disabled = false,
}: Props) {
  return (
    <section className="payment">
      <h2 className="payment__title">Cerrar venta</h2>
      {payments.length === 0 && (
        <span>No hay métodos de pago configurados.</span>
      )}

      <select
        id="payments"
        name="idPayment"
        value={idPayment}
        onChange={(e) => onPaymentChange(e.target.value)}
        required
        disabled={payments.length === 0 || disabled}
        className="payment__select"
      >
        <option value="" disabled className="payment__option--non-value">
          - Selecciona un método de pago -
        </option>
        {payments.map((pym) => (
          <option
            key={`opt_paymentId_${pym.id}`}
            value={pym.id}
            className="payment__option"
          >
            {pym.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={payments.length === 0 || !idPayment || disabled}
        onClick={onRequestClose}
        className="payment__btn"
      >
        {disabled ? "Procesando..." : "Pagar"}
      </button>
    </section>
  );
}
