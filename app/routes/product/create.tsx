import { Form, useActionData, useLoaderData } from "react-router-dom";
import { useState } from "react";
import { getProductDependenciesLoader } from "~/loaders/productLoader";
import type { Provider } from "~/types/provider";
import type { Brand } from "~/types/brand";
import type { Category } from "~/types/category";
import { FilterableSelect } from "./filter";
import sortAlphabetically from "~/utils/helpers/sortAlphabetically";
import { createProductAction } from "~/actions/product/createProduct";

export const action = createProductAction;
export const loader = getProductDependenciesLoader;

export default function CreateProductPage() {
  const actionData = useActionData() as {
    error?: string;
    status?: number;
    source?: "client" | "server";
  };

  const { providers, brands, categories } = useLoaderData() as {
    providers: Provider[];
    brands: Brand[];
    categories: Category[];
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

  return (
    <Form method="post">
      <label>Nombre del producto:</label>
      <input name="name" type="text" required />

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
      <input name="price" type="number" step="0.01" min="0" required />

      <FilterableSelect
        name="idCategory"
        label="Categoría"
        options={sortAlphabetically(categories)}
      />

      <FilterableSelect
        name="idProvider"
        label="Proveedor"
        options={sortAlphabetically(providers)}
      />

      <FilterableSelect
        name="idBrand"
        label="Marca"
        options={sortAlphabetically(brands)}
      />
      <button type="submit">Crear producto</button>

      {actionData?.error && (
        <p style={{ color: actionData.source === "server" ? "red" : "orange" }}>
          {actionData.error}
        </p>
      )}
    </Form>
  );
}
