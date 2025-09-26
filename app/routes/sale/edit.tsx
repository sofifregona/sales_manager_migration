import { Form, useLoaderData, useActionData } from "react-router-dom";
import type { Sale } from "~/types/sale";
import { saleLoader } from "~/loaders/saleLoader";
// import { updateSaleAction } from "~/actions/sale/updateSale";
import { useEffect, useMemo, useState, useRef } from "react";
import { FilterableSelect } from "../product/filter";
import type { Bartable } from "~/types/bartable";
import type { Employee } from "~/types/employee";
import type { Product } from "~/types/product";
import type { Payment } from "~/types/payment";
import type { Category } from "~/types/category";
import { normalizeText } from "~/utils/helpers/normalizeText";

export { saleLoader as loader };
// export { updateSaleAction as action };

export default function SaleEditPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };
  const { sale, products, categories, payments, prop, propType } =
    useLoaderData() as {
      sale: Sale;
      products: Product[];
      categories: Category[];
      payments: Payment[];
      prop: Bartable | Employee;
      propType: string;
    };

  const [code, setCode] = useState("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>();

  const ulRef = useRef<HTMLUListElement>(null);
  const liRefs = useRef<Record<number, HTMLLIElement | null>>({});

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const result = digits.replace(/^0+(?=[1-9])/, "").slice(0, 3);
    if (!digits) {
      setCode("");
    } else {
      setCode(result.padStart(3, "0"));
    }
    console.log(code);
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
        return nf.trim() === "" ? true : words.some((w) => w.startsWith(nf));
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
          ? `mesa: ${(prop as Bartable).number}`
          : `empleado: ${(prop as Employee).name}`}
      </h1>
      <Form method="post">
        <h2>Agregar producto</h2>
        <label>Producto:</label>
        <div className="categoriesList">
          <ul>
            <li
              key={"all"}
              onMouseDown={() => {
                setSelectedCategoryId(undefined);
              }}
              className={selectedCategoryId === undefined ? "is-selected" : ""}
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
        <div className="filterProducts">
          <div className="field">
            <label htmlFor="filterName">Nombre</label>
            <input
              id="filterName"
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Buscar por nombre…"
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

        <div className="productList">
          <ul>
            {filteredProducts.map((p) => (
              <li key={p.id}>
                <span
                  className="productName"
                  onClick={() => handleListProducts(p, "add")}
                >
                  {p.name}
                </span>{" "}
                <span className="productCode">
                  ({String(p.code ?? "").padStart(3, "0")})
                </span>
              </li>
            ))}
            {filteredProducts.length === 0 && (
              <li className="empty">No hay productos que coincidan.</li>
            )}
          </ul>
        </div>

        <h2>Lista de productos agregados</h2>
        <div className="addedProducts">
          <ul className="addedProductsList" ref={ulRef}>
            <li></li>
          </ul>
        </div>

        <h2>Cerrar venta</h2>
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
