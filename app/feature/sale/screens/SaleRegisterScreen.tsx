import {
  useFetcher,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type {
  SaleDTO,
  GroupedSaleDTO,
  SaleListFilterLoaderData,
} from "~/feature/sale/types/sale";
import { formatDateTime } from "~/utils/formatters/formatDateTime";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import { SaleRegisterFilter, type SaleGroupBy } from "../ui/SaleRegisterFilter";
import { SaleRegisterTable } from "../ui/SaleRegisterTable";

export function SaleListPanelScreen() {
  const { totalSales, flash } = useLoaderData<SaleListFilterLoaderData>();
  const deleteSaleFetcher = useFetcher();
  const deletingSale = deleteSaleFetcher.state !== "idle";
  const today = formatDateTime(new Date(), "yyyy-mm-dd");
  const [groupBy, setGroupBy] = useState<SaleGroupBy>(
    totalSales.groupBy as SaleGroupBy
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [lastDeleteId, setLastDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setGroupBy(totalSales.groupBy as SaleGroupBy);
  }, [totalSales.groupBy]);

  const submit = useSubmit();
  const [sp] = useSearchParams();
  const isSaleGroup = totalSales.groupBy === "sale";
  const sales = useMemo(
    () => (isSaleGroup ? (totalSales.sales as SaleDTO[]) : []),
    [isSaleGroup, totalSales.sales]
  );
  const groupedSales = useMemo(
    () => (!isSaleGroup ? (totalSales.sales as GroupedSaleDTO[]) : []),
    [isSaleGroup, totalSales.sales]
  );
  const flashMessage = flash?.error;
  const flashClass =
    flash?.source === "client" ? "flash--warn" : "flash--error";

  const handleConfirmDelete = () => {
    if (pendingDeleteId == null) return;
    deleteSaleFetcher.submit(
      { id: String(pendingDeleteId) },
      { method: "post", action: "." }
    );
    setLastDeleteId(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const deleteError = (deleteSaleFetcher.data as any)?.error as
    | string
    | undefined;

  return (
    <div>
      <h1>Ventas</h1>
      <h2>Filtrar</h2>

      {flashMessage && <p className={`flash ${flashClass}`}>{flashMessage}</p>}

      <SaleRegisterFilter
        startedDate={sp.get("startedDate") ?? today}
        finalDate={sp.get("finalDate") ?? today}
        groupBy={groupBy}
        onGroupChange={setGroupBy}
        onAutoSubmit={(form) => submit(form, { replace: true })}
      />

      <h2>Lista de ventas</h2>
      <SaleRegisterTable
        totalSales={totalSales}
        sales={sales}
        groupedSales={groupedSales}
        isSaleGroup={isSaleGroup}
        onDeleteRequest={setPendingDeleteId}
        isDeleting={deletingSale}
        lastDeleteId={lastDeleteId}
        deleteError={deleteError}
      />

      <ConfirmPrompt
        open={pendingDeleteId != null}
        message="Esta acción eliminará la venta y no podrá recuperar la información. ¿Está seguro de que desea continuar?"
        busy={deletingSale}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export function SaleListFilterErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de ventas.";
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
