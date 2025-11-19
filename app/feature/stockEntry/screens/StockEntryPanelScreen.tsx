import { useActionData, useLoaderData, useLocation } from "react-router-dom";
import type { StockEntryLoaderData } from "~/feature/stockEntry/stock-entry";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { StockEntryForm } from "../ui/StockEntryForm";
import { StockEntryTable } from "../ui/StockEntryTable";
import StockEntryListFilter from "../ui/StockEntryListFilter";

export function StockEntryPanelScreen() {
  const {
    stockEntries,
    products,
    providers,
    categories,
    brands,
    editingStockEntry,
    flash,
  } = useLoaderData<StockEntryLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();

  const isEditing = !!editingStockEntry;

  useUrlSuccessFlash("stock-entry");
  const { message } = useCrudSuccess("stock-entry", {
    "created-success": "Ingreso de stock creado con éxito.",
    "updated-success": "Ingreso de stock modificado con éxito.",
    "deleted-success": "Ingreso de stock eliminado con éxito.",
  });

  return (
    <div>
      <h1>Ingresos de stock</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="ingreso de stock"
        name={`stock para ${editingStockEntry?.product.name ?? null}`}
        cancelHref={(() => {
          const p = new URLSearchParams(location.search);
          ["id", "conflict", "code", "elementId", "message"].forEach((k) =>
            p.delete(k)
          );
          const qs = p.toString();
          return `/stock-entry${qs ? `?${qs}` : ""}`;
        })()}
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      <StockEntryForm
        key={
          isEditing
            ? `update-${editingStockEntry?.id}-stock-entry`
            : "create-stock-entry"
        }
        isEditing={isEditing}
        editing={editingStockEntry}
        products={products}
        providers={providers}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <StockEntryListFilter
        brands={brands}
        providers={providers}
        categories={categories}
      />

      <StockEntryTable
        stockEntries={stockEntries}
        editingId={editingStockEntry?.id ?? null}
      />
    </div>
  );
}

export function StockEntryPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de ingresos de stock.";
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
