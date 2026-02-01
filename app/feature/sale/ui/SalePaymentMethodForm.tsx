import type { PaymentMethodDTO } from "~/feature/paymentMethod/payment-method";

type Props = {
  paymentMethods: PaymentMethodDTO[];
  idPaymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  onRequestClose: () => void;
  disabled?: boolean;
};

export function SalePaymentMethodForm({
  paymentMethods,
  idPaymentMethod,
  onPaymentMethodChange,
  onRequestClose,
  disabled = false,
}: Props) {
  return (
    <section className="open-sale__payment-method">
      <h2 className="open-sale__payment-method-title">Cerrar venta</h2>
      {paymentMethods.length === 0 ? (
        <span className="open-sale__payment-method-span">
          No se han asignado métodos de pago.
        </span>
      ) : (
        <>
          <select
            id="paymentMethods"
            name="idPaymentMethod"
            value={idPaymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            required
            disabled={paymentMethods.length === 0 || disabled}
            className="open-sale__payment-method-select"
          >
            <option
              value=""
              disabled
              className="open-sale__payment-method-option--non-value"
            >
              - Selecciona un método de pago -
            </option>
            {paymentMethods.map((pym) => (
              <option
                key={`opt_paymentMethodId_${pym.id}`}
                value={pym.id}
                className="open-sale__payment-option"
              >
                {pym.name}
              </option>
            ))}
          </select>
          <button type="button" className="secondary-btn" disabled>
            Dividir pago
          </button>
          <button
            type="button"
            disabled={
              paymentMethods.length === 0 || !idPaymentMethod || disabled
            }
            onClick={onRequestClose}
            className="btn"
          >
            {disabled ? "Procesando..." : "Pagar"}
          </button>
        </>
      )}
    </section>
  );
}
