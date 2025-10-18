// **IMPORTS**
// Libraries
import {
  Form,
  useLoaderData,
  useActionData,
  useFetcher,
  Link,
} from "react-router-dom";
import { useMemo, useState } from "react";
// Types
import type { BartableDTO } from "~/feature/bartable/bartable";
import type { EmployeeDTO } from "~/feature/employee/employee";
import type { SaleLoaderData } from "~/feature/sale/types/sale";
// loader & Action

// Helpers
import { normalizeText } from "~/utils/strings/normalizeText";

export function OpenSalePanelScreen() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };
  const { sale, products, categories, payments, prop, propType } =
    useLoaderData<SaleLoaderData>();

  const productFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const payFetcher = useFetcher();

  const [code, setCode] = useState("");
  const [idPayment, setIdPayment] = useState("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const result = digits.replace(/^0+(?=[1-9])/, "").slice(0, 3);
    if (!digits) {
      setCode("");
    } else {
      setCode(result.padStart(3, "0"));
    }
  };

  const nf = normalizeText(nameFilter);
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        selectedCategoryId === undefined
          ? true
          : selectedCategoryId === null
          ? p.category == null || p.category?.id == null
          : p.category?.id === selectedCategoryId
      )
      .filter((p) => {
        const words = p.normalizedName.split(/[\s-]+/);
        return nf.trim() === ""
          ? true
          : words.some((w: string) => w.startsWith(nf));
      })
      .filter((p) => {
        if (!code) return true;
        return p.code.toString().startsWith(code.replace(/^0+/, ""));
      });
  }, [products, selectedCategoryId, nf, code]);

  return (
    <div>
      <h1>
        Venta abierta para{" "}
        {propType === "bartable"
          ? `mesa: ${(prop as BartableDTO).number}`
          : `empleado: ${(prop as EmployeeDTO).name}`}
      </h1>
      <Form method="post">
        <h2>Agregar producto</h2>
        <div className="filterProducts">
          <div className="field">
            <label htmlFor="filterName">Nombre</label>
            <input
              id="filterName"
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Buscar por nombreâ€¦"
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label htmlFor="filterCode">Código</label>
            <input
              id="filterCode"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={handleCodeChange}
              placeholder="000"
              autoComplete="off"
            />
          </div>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}
        >
          <div className="categoriesList">
            <h3>Categorías</h3>
            <ul>
              <li
                key={"all"}
                onMouseDown={() => {
                  setSelectedCategoryId(undefined);
                }}
                className={
                  selectedCategoryId === undefined ? "is-selected" : ""
                }
              >
                {"Todos"}
              </li>
              {categories.map((category) => (
                <li
                  key={category.id}
                  onMouseDown={() => {
                    setSelectedCategoryId(category.id);
                  }}
                  className={
                    selectedCategoryId === category.id ? "is-selected" : ""
                  }
                >
                  {category.name}
                </li>
              ))}
              <li
                key={"other"}
                onMouseDown={() => {
                  setSelectedCategoryId(null);
                }}
                className={selectedCategoryId === null ? "is-selected" : ""}
              >
                {"Otros"}
              </li>
            </ul>
            <input
              name={"category"}
              type="hidden"
              value={selectedCategoryId ?? ""}
            />
          </div>
          <div className="productList">
            <h3>Productos</h3>
            <ul>
              {filteredProducts.map((p) => (
                <li key={`li_filteredProduct_${p.id}`}>
                  <productFetcher.Form method="post" action=".">
                    <button
                      type="submit"
                      name="idProduct"
                      value={String(p.id)}
                      className="productBtn"
                    >
                      <span className="productName">{p.name}</span>{" "}
                      <span className="productCode">
                        ({String(p.code ?? "").padStart(3, "0")})
                      </span>
                      <input type="hidden" name="op" value="add" />
                    </button>
                  </productFetcher.Form>
                </li>
              ))}
              {filteredProducts.length === 0 && (
                <li className="empty">No hay productos que coincidan.</li>
              )}
            </ul>
          </div>
        </div>

        <h2>Lista de productos agregados</h2>
        {sale.products.length === 0 ? (
          <p>No hay productos agregadps</p>
        ) : (
          <div className="addedProducts">
            <table className="addedProductsList">
              <thead>
                <th style={{ width: 100 }}>Agregar</th>
                <th style={{ width: 500 }}>Producto</th>
                <th style={{ width: 100 }}>Disminuir</th>
              </thead>
              <tbody>
                {(sale.products ?? []).map((ps) => (
                  <tr key={`tr_product_${ps.id}`}>
                    <td style={{ width: 100 }}>
                      <productFetcher.Form method="post" action=".">
                        <button type="submit" name="op" value="substract">
                          <span>(-)</span>
                          <input
                            type="hidden"
                            value={ps.product.id}
                            name="idProduct"
                          />
                        </button>
                      </productFetcher.Form>
                    </td>
                    <td style={{ width: 500 }}>
                      {ps.product.name} {`Unidades: ${ps.quantity}`}{" "}
                      {`Subtotal: ${ps.subtotal}`}
                    </td>
                    <td style={{ width: 100 }}>
                      <productFetcher.Form method="post" action=".">
                        <button type="submit" name="op" value="add">
                          <span>(+)</span>
                          <input
                            type="hidden"
                            value={ps.product.id}
                            name="idProduct"
                          />
                        </button>
                      </productFetcher.Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <deleteFetcher.Form>
          <Link to={"../../sale/order"}>Eliminar venta</Link>
          <Link to={"../../sale/order"}>Volver atrás</Link>
        </deleteFetcher.Form>
        <h2>Total</h2>
        <span>{sale.total}</span>
        <h2>Cerrar venta</h2>
        <payFetcher.Form method="post" action=".">
          {payments.length === 0 && (
            <span>No hay métodos de pago configurados.</span>
          )}

          <select
            id="payments"
            name="idPayment"
            value={idPayment}
            onChange={(e) => setIdPayment(e.target.value)}
            required
          >
            <option value="" disabled>
              — Selecciona un método de pago —
            </option>
            {payments.map((pym) => (
              <option key={`opt_paymentId_${pym.id}`} value={pym.id}>
                {pym.name}
              </option>
            ))}
          </select>
          <input id="open" type="hidden" name="open" value={"false"} />
          <button type="submit">Pagar</button>
        </payFetcher.Form>
      </Form>
    </div>
  );
}

export function SaleEditErrorBoundary({ error }: { error: unknown }) {
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
