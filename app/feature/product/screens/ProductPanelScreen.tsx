import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import type { ProductLoaderData } from "~/feature/product/product";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { ProductForm } from "../ui/ProductForm";
import { ProductTable } from "../ui/ProductTable";
import ListFilter from "../ui/ProductFilter";

export function ProductPanelScreen() {
  const { products, editingProduct, brands, categories, providers, flash } =
    useLoaderData<ProductLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();

  const isEditing = !!editingProduct;

  useUrlSuccessFlash("product");
  const { message } = useCrudSuccess("product", {
    "created-success": "Producto creado con éxito.",
    "updated-success": "Producto modificado con éxito.",
    "deactivated-success": "Producto eliminado con éxito.",
    "reactivated-success": "Producto reactivado con éxito.",
    "incremented-success": "Precios incrementados con éxito.",
  });

  return (
    <div>
      <h1>Productos</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="producto"
        name={editingProduct?.name ?? null}
        cancelHref={(() => {
          const p = new URLSearchParams(location.search);
          ["id", "conflict", "code", "elementId", "message"].forEach((k) =>
            p.delete(k)
          );
          const qs = p.toString();
          return `/product${qs ? `?${qs}` : ""}`;
        })()}
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      <ProductForm
        key={
          isEditing ? `update-${editingProduct?.id}-product` : "create-product"
        }
        isEditing={isEditing}
        editing={editingProduct}
        brands={brands}
        categories={categories}
        providers={providers}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <ListFilter
        brands={brands}
        categories={categories}
        providers={providers}
      />

      <ProductTable
        products={products}
        editingId={editingProduct?.id ?? null}
      />
    </div>
  );
}

export function ProductPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de productos.";
  if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div>
      <h2 style={{ color: "red" }}>Error</h2>
      <p>{message}</p>
    </div>
  );
}
