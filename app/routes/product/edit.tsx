import {
  Form,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import { useState } from "react";
import type { Product } from "~/types/product";
import { productLoader } from "~/loaders/productLoader";
import { updateProductAction } from "~/actions/product/updateProduct";
import { FilterableSelect } from "./filter";
import sortAlphabetically from "~/utils/helpers/sortAlphabetically";
import { productEditLoader } from "~/loaders/productLoader";
import type { Provider } from "~/types/provider";
import type { Brand } from "~/types/brand";
import type { Category } from "~/types/category";

export { productEditLoader as loader };
export { updateProductAction as action };

export default function ProductEditPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const { providers, brands, categories, product } = useLoaderData() as {
    providers: Provider[];
    brands: Brand[];
    categories: Category[];
    product: Product;
  };

  const [code, setCode] = useState(product.code.toString().padStart(3, "0"));

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const result = digits.replace(/^0+(?=[1-9])/, "").slice(0, 3);
    if (!digits) {
      setCode("");
    } else {
      setCode(result.padStart(3, "0"));
    }
  };

  return (
    <Form method="post">
      <label>Nombre del producto:</label>
      <input name="name" type="text" defaultValue={product.name} required />

      <label>Código:</label>
      <input
        name="code"
        type="text"
        value={code}
        inputMode="numeric"
        onChange={handleCodeChange}
        required
      />

      <label>Precio:</label>
      <input
        name="price"
        type="number"
        defaultValue={product.price.toString()}
        step="0.01"
        min="0"
        required
      />

      <FilterableSelect
        name="idCategory"
        label="Categoría"
        options={sortAlphabetically(categories)}
        initialId={product.category?.id}
      />

      <FilterableSelect
        name="idProvider"
        label="Proveedor"
        options={sortAlphabetically(providers)}
        initialId={product.provider?.id}
      />

      <FilterableSelect
        name="idBrand"
        label="Marca"
        options={sortAlphabetically(brands)}
        initialId={product.brand?.id}
      />
      <button type="submit">Guardar cambios</button>
      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
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
