import {
  useLoaderData,
  useFetcher,
  Link,
  Form,
  useSubmit,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import type { Product } from "~/types/product";
import { SortToggle } from "./sort-toggle";
import { productListLoader } from "~/loaders/productLoader";
import { incrementPriceAction } from "~/actions/product/incrementPrice";
export { productListLoader as loader };
export { incrementPriceAction as action };

export default function ProductListPage() {
  const { products, providers, brands, categories } = useLoaderData() as {
    products: Product[];
    providers: { id: number; name: string }[];
    brands: { id: number; name: string }[];
    categories: { id: number; name: string }[];
  };

  const submit = useSubmit();
  const [sp] = useSearchParams();
  const deleteFetcher = useFetcher();
  const incrementFetcher = useFetcher();
  const loc = useLocation();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const visibleIds = useMemo(() => products.map((p) => p.id), [products]);

  useEffect(() => {
    const visible = new Set(visibleIds);
    setSelectedIds(
      (prev) => new Set([...prev].filter((id) => visible.has(id)))
    );
  }, [visibleIds.join(",")]);

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => selectedIds.has(id));
  const masterRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (masterRef.current)
      masterRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) visibleIds.forEach((id) => next.add(id));
      else visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };
  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  return (
    <div>
      <h1>Productos</h1>
      <h2>Filtros</h2>

      <Form
        method="get"
        onChange={(e) => submit(e.currentTarget, { replace: true })}
        id="filters"
      >
        <label>Filtrar por nombre</label>
        <input name="name" defaultValue={sp.get("name") ?? ""} />
        <SortToggle field="name" />

        <label>Filtrar por código</label>
        <input name="code" defaultValue={sp.get("code") ?? ""} />
        <SortToggle field="code" />

        <label>Precio mínimo</label>
        <input
          name="minPrice"
          type="number"
          step="0.01"
          min="0"
          defaultValue={sp.get("minPrice") ?? ""}
        />

        <label>Precio máximo</label>
        <input
          name="maxPrice"
          type="number"
          step="0.01"
          min="0"
          defaultValue={sp.get("maxPrice") ?? ""}
        />
        <SortToggle field="price" />

        <label>Seleccionar proveedor</label>
        <select name="idProvider" defaultValue={sp.get("idProvider") ?? ""}>
          <option value="">Todos los proveedores</option>
          <option value="null">— Sin proveedor —</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label>Seleccionar marca</label>
        <select name="idBrand" defaultValue={sp.get("idBrand") ?? ""}>
          <option value="">Todas las marcas</option>
          <option value="null">— Sin marca —</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <label>Seleccionar categoría</label>
        <select name="idCategory" defaultValue={sp.get("idCategory") ?? ""}>
          <option value="">Todas las categorías</option>
          <option value="null">— Sin categoría —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="hidden"
          name="sortField"
          defaultValue={sp.get("sortField") ?? "name"}
        />
        <input
          type="hidden"
          name="sortDirection"
          defaultValue={(sp.get("sortDirection") ?? "ASC").toUpperCase()}
        />
      </Form>

      <incrementFetcher.Form
        id="incrementForm"
        method="post"
        style={{ margin: "12px 0" }}
      >
        <input
          type="hidden"
          name="returnTo"
          value={`${loc.pathname}${loc.search}`}
        />
        <span>Seleccionados: {selectedIds.size}</span>{" "}
        {incrementFetcher.data?.error && (
          <p style={{ color: "red" }}>{incrementFetcher.data.error}</p>
        )}
      </incrementFetcher.Form>

      <h2>Lista</h2>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                ref={masterRef}
                checked={allVisibleSelected}
                onChange={(e) => toggleAllVisible(e.currentTarget.checked)}
              />{" "}
            </th>
            <th>Nombre</th>
            <th>Código</th>
            <th>Precio</th>
            <th>Proveedor</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="checkbox"
                  form="incrementForm" // se envía con el bulkForm
                  name="ids" // el servidor recibe ids=...
                  value={String(product.id)}
                  checked={selectedIds.has(product.id)}
                  onChange={(e) =>
                    toggleOne(product.id, e.currentTarget.checked)
                  }
                />
              </td>
              <td>{product.name}</td>
              <td>{product.code.toString().padStart(3, "0")}</td>
              <td>{product.price}</td>
              <td>{product.provider?.name}</td>
              <td>{product.brand?.name}</td>
              <td>{product.category?.name}</td>
              <td>
                <Link to={`/product/${product.id}/edit`}>Modificar</Link>
                {" | "}
                <deleteFetcher.Form
                  method="post"
                  action={`/product/${product.id}/deactivate`}
                  onSubmit={(e) => {
                    if (!confirm("¿Seguro que desea eliminar este producto?")) {
                      e.preventDefault();
                    }
                  }}
                  style={{ display: "inline" }}
                >
                  <button type="submit">Eliminar</button>
                  {deleteFetcher.data?.error && (
                    <p style={{ color: "red" }}>{deleteFetcher.data.error}</p>
                  )}
                </deleteFetcher.Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
      >
        <label>
          % a aumentar:
          <input
            form="incrementForm" // este input también va al form global
            name="percent"
            type="number"
            step={1}
            inputMode="numeric"
            pattern="\d+"
            style={{ width: 80, marginLeft: 6 }}
            required
          />
        </label>
        <button
          type="submit"
          form="incrementForm"
          name="intent"
          value="increase"
          disabled={selectedIds.size === 0}
          onClick={(e) => {
            const fd = new FormData(
              document.getElementById("incrementForm") as HTMLFormElement
            );
            const pct = (fd.get("percent") ?? "").toString().trim();
            if (
              !confirm(
                `¿Está seguro de que desea aplicar ${pct}% a los productos seleccionados?`
              )
            )
              e.preventDefault();
          }}
        >
          Aumentar
        </button>
        {incrementFetcher.data?.error && (
          <p style={{ color: "red" }}>{incrementFetcher.data.error}</p>
        )}
      </div>
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
