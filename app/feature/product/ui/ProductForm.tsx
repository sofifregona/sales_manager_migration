import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProductDTO } from "~/feature/product/product";
import type { ProviderDTO } from "~/feature/provider/provider";
import { FilterableSelect } from "./FilterableSelect";
import sortAlphabetically from "~/utils/sorting/sortAlphabetically";

type Props = {
  isEditing: boolean;
  editing?: ProductDTO | null;
  categories: CategoryDTO[];
  brands: BrandDTO[];
  providers: ProviderDTO[];
  isSubmitting: boolean;
  formAction: string; // "." o `.${search}`
};

export function ProductForm({
  isEditing,
  editing,
  categories,
  brands,
  providers,
  isSubmitting,
  formAction,
}: Props) {
  const [name, setName] = useState<string | undefined>(editing?.name ?? "");
  const [code, setCode] = useState<string | undefined>(
    editing?.code.toString().padStart(3, "0") ?? ""
  );
  const [price, setPrice] = useState<number | string | undefined>(
    editing?.price ?? ""
  );
  const [idBrand, setIdBrand] = useState(editing?.brand?.id ?? undefined);
  const [idCategory, setIdCategory] = useState(
    editing?.category?.id ?? undefined
  );
  const [idProvider, setIdProvider] = useState(
    editing?.provider?.id ?? undefined
  );
  const [stockEnabled, setStockEnabled] = useState(false);
  const [negativeQtyWarning, setNegativeQtyWarning] = useState(true);
  const [minQtyWarning, setMinQtyWarning] = useState(false);
  const [minQty, setMinQty] = useState();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const result = digits.replace(/^0+(?=[1-9])/, "").slice(0, 3);
    if (!digits) {
      setCode("");
    } else {
      setCode(result.padStart(3, "0"));
    }
  };

  useEffect(() => {
    if (isEditing) {
      setName(editing?.name);
      setCode(editing?.code.toString().padStart(3, "0"));
      setPrice(editing?.price);
      setIdBrand(editing?.brand?.id ?? undefined);
      setIdCategory(editing?.category?.id ?? undefined);
      setIdProvider(editing?.provider?.id ?? undefined);
    } else if (!isEditing) {
      setName("");
      setCode("");
      setPrice("");
      setIdBrand(undefined);
      setIdCategory(undefined);
      setIdProvider(undefined);
    }
  }, [isEditing, editing]);

  return (
    <Form method="post" action={formAction} className="product-form">
      <label htmlFor="name">Nombre *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) =>
          setName((e.target.value ?? "").replace(/\s+/g, " ").trim())
        }
        maxLength={80}
        minLength={3}
        required
      />
      <label htmlFor="code">Código *</label>
      <input
        id="code"
        name="code"
        value={code}
        inputMode="numeric"
        onChange={handleCodeChange}
        required
      />
      <label htmlFor="price">Precio</label>
      <input
        id="price"
        name="price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        step="0.01"
        min="0"
        required
      />
      <FilterableSelect
        name="idBrand"
        label={["Marca", "marcas"]}
        url="brand"
        options={sortAlphabetically(brands)}
        initialId={idBrand}
        editing={editing?.id}
      />
      <FilterableSelect
        name="idCategory"
        label={["Categoría", "categorías"]}
        url="category"
        options={sortAlphabetically(categories)}
        initialId={idCategory}
        editing={editing?.id}
      />
      <FilterableSelect
        name="idProvider"
        label={["Proveedor", "proveedores"]}
        url="provider"
        options={sortAlphabetically(providers)}
        initialId={idProvider}
        editing={editing?.id}
      />

      <label htmlFor="stockEnabled">Habilitar stock</label>
      <input
        type="checkbox"
        name="stockEnabled"
        checked={stockEnabled}
        onChange={(e) => setStockEnabled(e.currentTarget.checked)}
      />

      <label htmlFor="negativeQtyWarning"></label>
      <input
        type="checkbox"
        name="negativeQtyWarning"
        checked={stockEnabled ? negativeQtyWarning : true}
        disabled={!stockEnabled}
        onChange={(e) => setNegativeQtyWarning(e.currentTarget.checked)}
      />

      <input
        type="hidden"
        name="_action"
        value={isEditing ? "update" : "create"}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>

      <p className="hint">(*) Campos obligatorios.</p>
    </Form>
  );
}
