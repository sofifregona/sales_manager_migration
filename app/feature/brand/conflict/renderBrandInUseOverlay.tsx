import { makeRenderSwapOverlay } from "~/shared/conflict/renderSwapOverlay";

export const renderBrandSwapOverlay = makeRenderSwapOverlay({
  inUseCode: "BRAND_IN_USE",
  buildMessage: (count: number) =>
    `La marca actual tiene ${count} producto${
      count === 1 ? "" : "s"
    } asociados. Elegí una opción para continuar:`,
  actions: [
    {
      label: "Desactivar solo marca",
      strategy: "clear-products-brand",
      variant: "secondary",
    },
    {
      label: "Desactivar marca y productos",
      strategy: "cascade-deactivate-products",
      variant: "secondary",
    },
  ],
});
