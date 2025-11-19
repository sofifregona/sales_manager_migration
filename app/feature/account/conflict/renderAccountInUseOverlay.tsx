import { makeRenderSwapOverlay } from "~/shared/conflict/renderSwapOverlay";

export const renderAccountSwapOverlay = makeRenderSwapOverlay({
  inUseCode: "ACCOUNT_IN_USE",
  buildMessage: (count: number) =>
    `La cuenta que desea desactivar tiene ${
      count === 1
        ? "un método de pago asociado"
        : `${count} métodos de pago asociados`
    }.\nSi desactiva la cuenta, también se desactivarán los métodos de pago asociados a esta.`,
  actions: [
    {
      label: "Continuar y desactivar pagos",
      strategy: "cascade-delete-payments",
      variant: "secondary",
    },
  ],
});
