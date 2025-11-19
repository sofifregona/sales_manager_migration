import React, { useEffect, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProductDTO } from "~/feature/product/product";
import type { ProviderDTO } from "~/feature/provider/provider";
import { FilterableSelect } from "~/shared/ui/form/FilterableSelect";
import sortAlphabetically from "~/utils/sorting/sortAlphabetically";
import type { StockEntryDTO } from "../stock-entry";

type Props = {
  isEditing: boolean;
  editing?: StockEntryDTO | null;
  products: ProductDTO[];
  providers: ProviderDTO[];
  formAction: string; // "." o `.${search}`
};

export function StockEntryForm({
  isEditing,
  editing,
  products,
  providers,
  formAction,
}: Props) {
  const [idProduct, setIdProduct] = useState<number | undefined>(
    editing?.product.id ?? undefined
  );
  const [quantity, setQuantity] = useState<number | string | undefined>(
    editing?.quantity ?? undefined
  );
  const [idProvider, setIdProvider] = useState<number | undefined>(
    editing?.product.provider ?? undefined
  );
  const [comments, setComments] = useState<string | undefined>(
    editing?.comments ?? undefined
  );

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  useEffect(() => {
    if (isEditing) {
      setIdProduct(editing?.product.id);
      setQuantity(editing?.quantity);
      setIdProvider(editing?.product.provider);
      setComments(editing?.comments ?? "");
    } else if (!isEditing) {
      setIdProduct(undefined);
      setQuantity(undefined);
      setIdProvider(undefined);
      setComments(undefined);
    }
  }, [isEditing, editing]);

  const p = new URLSearchParams(location.search);
  const successFlags = ["created", "updated", "deleted"];
  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setIdProduct(undefined);
      setQuantity(undefined);
      setIdProvider(undefined);
      setComments(undefined);
    }
  }, [location.search, isEditing]);

  return (
    <Form method="post" action={formAction} className="product-form">
      <FilterableSelect
        name="idProduct"
        label={["Producto", "productos"]}
        url="product"
        options={sortAlphabetically(products)}
        initialId={idProduct}
        editing={editing?.id}
      />

      <label htmlFor="quantity">Cantidad inicial</label>
      <input
        id="quantity"
        type="number"
        name="quantity"
        value={quantity}
        step={1}
        min={0}
        onChange={(e) => setQuantity(e.currentTarget.value)}
      />

      <FilterableSelect
        name="idProvider"
        label={["Proveedor", "proveedores"]}
        url="provider"
        options={sortAlphabetically(providers)}
        initialId={idProvider}
        editing={editing?.id}
      />

      <label htmlFor="comments">Comentarios</label>
      <input
        id="comments"
        name="comments"
        type="text"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
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
