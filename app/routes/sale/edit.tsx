import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import type { Sale } from "~/types/sale";
import { saleLoader } from "~/loaders/saleLoader";
// import { updateSaleAction } from "~/actions/sale/updateSale";
import { useState } from "react";
import { FilterableSelect } from "../product/filter";
import type { Bartable } from "~/types/bartable";
import type { Employee } from "~/types/employee";
import type { Product } from "~/types/product";
import type { Payment } from "~/types/payment";

export { saleLoader as loader };
// export { updateSaleAction as action };

export default function SaleEditPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const { sale, products, payments, prop, propType } = useLoaderData() as {
    sale: Sale;
    products: Product[];
    payments: Payment[];
    prop: Bartable | Employee;
    propType: string;
  };

  const [code, setCode] = useState("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const result = digits.replace(/^0+(?=[1-9])/, "").slice(0, 3);
    if (!digits) {
      setCode("");
    } else {
      setCode(result.padStart(3, "0"));
    }
  };

  let propText = "mesa";
  let propValue = "";
  if ("number" in prop) {
    propValue = prop.number.toString();
  }
  if ("name" in prop) {
    propText = "empleado";
    propValue = prop.name;
  }

  return (
    <div>
      <h1>
        Venta abierta para {propText}: {propValue}
      </h1>
      <Form method="post">
        <h2>Agregar producto</h2>
        <label>Producto:</label>
        {/* <FilterableSelect
          name="idProduct"
          label="Producto"
          options={sortAlphabetically(products)}
        /> */}

        <h2>Lista de productos agregados</h2>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar el método de pago";
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
