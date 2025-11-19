import { useLoaderData, useActionData } from "react-router-dom";
import type { SaleListLoaderData } from "~/feature/sale/types/sale";
import { BartableList } from "~/feature/sale/ui/BartableList";
import { EmployeeList } from "~/feature/sale/ui/EmployeeList";
import "./OrderPanelScreen.sass";

export function OrderPanelScreen() {
  const { sales, bartables, employees } = useLoaderData<SaleListLoaderData>();
  useActionData();

  return (
    <div className="order-panel">
      <BartableList sales={sales} bartables={bartables} />
      <EmployeeList sales={sales} employees={employees} />
    </div>
  );
}

export function SaleListErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la venta";
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
