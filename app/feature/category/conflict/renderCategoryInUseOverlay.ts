import { makeRenderSwapOverlay } from "~/shared/conflict/renderSwapOverlay";

export const renderCategorySwapOverlay = makeRenderSwapOverlay({
  inUseCode: "CATEGORY_IN_USE",
  buildMessage: (count: number) =>
    `La categoría actual tiene ${count} producto${count === 1 ? "" : "s"} asociados. Elija una opción para continuar:`,
  actions: [
    {
      label: "Desactivar solo categoría",
      strategy: "clear-products-category",
      variant: "secondary",
    },
    {
      label: "Desactivar categoría y productos",
      strategy: "cascade-deactivate-products",
      variant: "secondary",
    },
  ],
});

