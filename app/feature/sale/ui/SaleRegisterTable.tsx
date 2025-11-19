import type {
  GroupedSaleDTO,
  SaleDTO,
  TotalSalesDTO,
} from "~/feature/sale/types/sale";
import { formatDateTime } from "~/utils/formatters/formatDateTime";

type Props = {
  totalSales: TotalSalesDTO;
  sales: SaleDTO[];
  groupedSales: GroupedSaleDTO[];
  isSaleGroup: boolean;
  onDeleteRequest: (saleId: number) => void;
  isDeleting: boolean;
  lastDeleteId: number | null;
  deleteError?: string;
};

export function SaleRegisterTable({
  totalSales,
  sales,
  groupedSales,
  isSaleGroup,
  onDeleteRequest,
  isDeleting,
  lastDeleteId,
  deleteError,
}: Props) {
  const footerColSpan = isSaleGroup ? 4 : 3;
  const hasRows = isSaleGroup ? sales.length > 0 : groupedSales.length > 0;

  if (!hasRows) {
    return <p>No hay ventas disponibles.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          {isSaleGroup && <th>Fecha y hora</th>}
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
                <td>{formatDateTime(sale.dateTime, "dd-mm-yyyy hh:mm:ss")}</td>
                <td>
                  {sale.bartable
                    ? `Mesa ${sale.bartable.number}`
                    : sale.employee?.name ?? "-"}
                </td>
                <td>{sale.total}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(sale.id)}
                    disabled={isDeleting}
                    style={{ display: "inline-block", marginLeft: 8 }}
                  >
                    {isDeleting && lastDeleteId === sale.id
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                  {deleteError && lastDeleteId === sale.id && (
                    <div className="inline-error" role="alert">
                      {deleteError}
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
  );
}
