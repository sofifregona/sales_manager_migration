import {
  Form,
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

export function SaleListPanelScreen() {
  const { totalSales, flash } = useLoaderData<SaleListFilterLoaderData>();
  const deleteSaleFetcher = useFetcher();
  const deletingSale = deleteSaleFetcher.state !== "idle";
  const today = formatDateTime(new Date(), "yyyy-mm-dd");
  const [groupBy, setGroupBy] = useState(totalSales.groupBy);

  useEffect(() => {
    setGroupBy(totalSales.groupBy);
  }, [totalSales.groupBy]);

  const submit = useSubmit();
  const [sp] = useSearchParams();
  const isSaleGroup = totalSales.groupBy === "sale";
  const footerColSpan = isSaleGroup ? 4 : 3;
  const sales = useMemo(
    () => (isSaleGroup ? (totalSales.sales as SaleDTO[]) : []),
    [isSaleGroup, totalSales.sales]
  );
  const groupedSales = useMemo(
    () => (!isSaleGroup ? (totalSales.sales as GroupedSaleDTO[]) : []),
    [isSaleGroup, totalSales.sales]
  );
  const hasRows = isSaleGroup ? sales.length > 0 : groupedSales.length > 0;
  const flashMessage = flash?.error;
  const flashClass =
    flash?.source === "client" ? "flash--warn" : "flash--error";

  return (
    <div>
      <h1>Ventas</h1>
      <h2>Filtrar</h2>

      {flashMessage && <p className={`flash ${flashClass}`}>{flashMessage}</p>}

      <Form
        method="get"
        onChange={(event) => submit(event.currentTarget, { replace: true })}
        id="filter"
      >
        <label htmlFor="startedDate">Fecha inicial</label>
        <input
          id="startedDate"
          type="date"
          name="startedDate"
          defaultValue={sp.get("startedDate") ?? today}
        />

        <label htmlFor="finalDate">Fecha final</label>
        <input
          id="finalDate"
          type="date"
          name="finalDate"
          defaultValue={sp.get("finalDate") ?? today}
        />

        <h2>Agrupar</h2>
        <button type="submit" onClick={() => setGroupBy("sale")}>
          Venta
        </button>
        <button type="submit" onClick={() => setGroupBy("product")}>
          Producto
        </button>
        <button type="submit" onClick={() => setGroupBy("category")}>
          Categoría
        </button>
        <button type="submit" onClick={() => setGroupBy("brand")}>
          Marca
        </button>
        <button type="submit" onClick={() => setGroupBy("provider")}>
          Proveedor
        </button>
        <input type="hidden" name="groupBy" value={groupBy} />
      </Form>

      <h2>Lista de ventas</h2>
      {!hasRows ? (
        <p>No hay ventas disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {isSaleGroup && (
                <>
                  <th>Fecha y hora</th>
                </>
              )}
              <th>{totalSales.label}</th>
              {!isSaleGroup && <th>Unidades</th>}
              <th>Ingreso</th>
              {isSaleGroup && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {isSaleGroup
              ? sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      {formatDateTime(sale.dateTime, "dd-mm-yyyy hh:mm:ss")}
                    </td>
                    <td>
                      {sale.bartable
                        ? `Mesa ${sale.bartable.number}`
                        : sale.employee?.name ?? "-"}
                    </td>
                    <td>{sale.total}</td>
                    <td>
                      <deleteSaleFetcher.Form
                        method="post"
                        action="."
                        onSubmit={(event) => {
                          if (
                            !confirm(
                              "¿Seguro que deseas eliminar esta venta? Los datos no podrán recuperarse."
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={sale.id} />
                        <button type="submit" disabled={deletingSale}>
                          {deletingSale ? "Eliminando..." : "Eliminar"}
                        </button>
                      </deleteSaleFetcher.Form>
                      {deleteSaleFetcher.data?.error && (
                        <div className="inline-error" role="alert">
                          {deleteSaleFetcher.data.error}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              : groupedSales.map((group) => (
                  <tr key={group.groupId}>
                    <td>{group.groupName}</td>
                    <td>{group.units}</td>
                    <td>{group.total}</td>
                  </tr>
                ))}
            <tr>
              <td colSpan={footerColSpan}>Total: {totalSales.total}</td>
            </tr>
          </tbody>
        </table>
      )}
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
