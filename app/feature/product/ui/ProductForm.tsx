import React, { useCallback, useEffect, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProductDTO } from "~/feature/product/product";
import type { ProviderDTO } from "~/feature/provider/provider";
import { FilterableSelect } from "../../../shared/ui/form/FilterableSelect";
import sortAlphabetically from "~/utils/sorting/sortAlphabetically";
import { ProductImageInput } from "./ProductImageInput";
import { MdInfoOutline } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

type Props = {
  isEditing: boolean;
  editing?: ProductDTO | null;
  categories: CategoryDTO[];
  brands: BrandDTO[];
  providers: ProviderDTO[];
  formAction: string; // "." o `.${search}`
  cancelHref: string;
  onCancel?: () => void;
  actionError?: string;
};

export function ProductForm({
  isEditing,
  editing,
  categories,
  brands,
  providers,
  formAction,
  cancelHref,
  onCancel,
  actionError,
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
  const [stockEnabled, setStockEnabled] = useState<boolean | undefined>(
    editing?.stockEnabled ?? false
  );
  const [quantity, setQuantity] = useState<number | string>(
    editing?.quantity ?? ""
  );
  const [negativeQtyWarning, setNegativeQtyWarning] = useState<
    boolean | undefined
  >(editing?.negativeQuantityWarning ?? true);
  const [minQtyWarning, setMinQtyWarning] = useState<boolean | undefined>(
    editing?.minQuantityWarning ?? false
  );
  const [minQty, setMinQty] = useState<number | string>(
    editing?.minQuantity ?? ""
  );

  const [imageResetKey, setImageResetKey] = useState(0);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();
  const resetImageInput = useCallback(() => {
    setImageResetKey((prev) => prev + 1);
  }, []);

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
      setStockEnabled(editing?.stockEnabled);
      setQuantity(editing?.quantity ?? "");
      setNegativeQtyWarning(editing?.negativeQuantityWarning ?? true);
      setMinQtyWarning(editing?.minQuantityWarning ?? false);
      setMinQty(editing?.minQuantity ?? "");
    } else if (!isEditing) {
      setName("");
      setCode("");
      setPrice("");
      setIdBrand(undefined);
      setIdCategory(undefined);
      setIdProvider(undefined);
      setStockEnabled(false);
      setQuantity("");
      setNegativeQtyWarning(true);
      setMinQtyWarning(false);
      setMinQty("");
      resetImageInput();
    }
  }, [isEditing, editing, resetImageInput]);

  const p = new URLSearchParams(location.search);
  const successFlags = [
    "created",
    "updated",
    "deactivated",
    "reactivated",
    "incremented",
  ];

  const hasSuccess = successFlags.some((k) => p.get(k) === "1");

  useEffect(() => {
    if (hasSuccess) {
      setName("");
      setCode("");
      setPrice("");
      setIdBrand(undefined);
      setIdCategory(undefined);
      setIdProvider(undefined);
      setStockEnabled(false);
      setQuantity("");
      setNegativeQtyWarning(true);
      setMinQtyWarning(false);
      setMinQty("");
      resetImageInput();
    }
  }, [location.search, hasSuccess, isEditing, resetImageInput]);

  return (
    <Form
      method="post"
      action={formAction}
      className="form product-form"
      encType="multipart/form-data"
    >
      <ProductImageInput key={imageResetKey} url={editing?.imageUrl} />
      <div className="form-input__div">
        <div className="form-pill pill-name-product">
          <label htmlFor="name" className="form-pill__label label-name-product">
            Nombre *
          </label>
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
            className="form-pill__input input-name-product"
          />
        </div>

        <div className="form-pill pill-code-product">
          <label htmlFor="code" className="form-pill__label label-code-product">
            Código *
          </label>
          <input
            id="code"
            name="code"
            value={code}
            inputMode="numeric"
            onChange={handleCodeChange}
            required
            className="form-pill__input input-code-product"
          />
        </div>

        <div className="form-pill pill-price-product">
          <label
            htmlFor="price"
            className="form-pill__label label-price-product"
          >
            Precio
          </label>
          <input
            id="price"
            name="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0"
            required
            className="form-pill__input input-price-product"
          />
        </div>

        <div className="filterable-inputs">
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
        </div>
      </div>

      <div className="form-pill__stock">
        <h3 className="form-pill__stock-subtitle">Configurar stock</h3>
        <div className="form-pill__stock-checkbox">
          <div className="form-pill pill-stock-check">
            <label
              htmlFor="stockEnabled"
              className="form-pill__stock-checkbox-label label-stock-product"
            >
              Registrar stock
            </label>
            <input
              type="checkbox"
              name="stockEnabled"
              checked={stockEnabled}
              onChange={(e) => setStockEnabled(e.currentTarget.checked)}
              className="form-pill__stock-checkbox-input input-stock-ptoduct"
            />
          </div>
          <div className="form-pill pill-negative-qty-check">
            <label
              htmlFor="negativeQtyWarning"
              className={
                !stockEnabled
                  ? "form-pill__stock-checkbox-label label--no-av label-negative-qty-product"
                  : "form-pill__stock-checkbox-label label-negative-qty-product"
              }
            >
              Aviso de stock negativo
              <span
                className="help-icon"
                title={`Si activa esta opción, el sistema le avisará\n cuando se realice una venta de un producto que no registra unidades disponibles.`}
              >
                <MdInfoOutline />
              </span>
            </label>
            <input
              type="checkbox"
              name="negativeQtyWarning"
              checked={negativeQtyWarning}
              disabled={!stockEnabled}
              onChange={(e) => setNegativeQtyWarning(e.currentTarget.checked)}
              className={
                !stockEnabled
                  ? "form-pill__stock-checkbox-input input-negative-qty-product check--no-av"
                  : "form-pill__stock-checkbox-input input-negative-qty-product"
              }
            />
          </div>
          <div className="form-pill pill-min-qty-check">
            <label
              htmlFor="minQtyWarning"
              className={
                !stockEnabled
                  ? "form-pill__stock-checkbox-label label--no-av label-min-qty-product"
                  : "form-pill__stock-checkbox-label label-min-qty-product"
              }
            >
              Aviso de stock mínimo
              <span
                className="help-icon"
                title={`Si activa esta opción, el sistema le avisará cuando las unidades de un producto\n lleguen a un valor mínimo definido.`}
              >
                <MdInfoOutline />
              </span>
            </label>
            <input
              type="checkbox"
              name="minQtyWarning"
              checked={minQtyWarning}
              disabled={!stockEnabled}
              onChange={(e) => setMinQtyWarning(e.currentTarget.checked)}
              className={
                !stockEnabled
                  ? "form-pill__stock-checkbox-input input-min-qty-product check--no-av"
                  : "form-pill__stock-checkbox-input input-min-qty-product"
              }
            />
          </div>
        </div>

        <div className="form-pill__stock-qtys">
          <div className="form-pill pill-qty">
            <label
              htmlFor="quantity"
              className={
                !stockEnabled
                  ? "form-pill__stock-qtys-label label--no-av label-qty-product"
                  : "form-pill__stock-qtys-label label-qty-product"
              }
            >
              Stock inicial
            </label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              value={stockEnabled ? quantity : ""}
              step={1}
              min={0}
              disabled={!stockEnabled}
              onChange={(e) => setQuantity(e.currentTarget.value)}
              className={
                !stockEnabled
                  ? "form-pill__stock-qtys-input input--no-av input-qty-product"
                  : "form-pill__stock-qtys-input input-qty-product"
              }
            />
          </div>
          <div className="form-pill pill-min-qty">
            <label
              htmlFor="minQuantity"
              className={
                !minQtyWarning || !stockEnabled
                  ? "form-pill__stock-qtys-label label--no-av label-min-qty-product"
                  : "form-pill__stock-qtys-label label-min-qty-product"
              }
            >
              Stock mínimo
            </label>
            <input
              id="minQuantity"
              type="number"
              name="minQuantity"
              value={stockEnabled && minQtyWarning ? minQty : ""}
              step={1}
              min={0}
              disabled={!minQtyWarning || !stockEnabled}
              onChange={(e) => setMinQty(e.currentTarget.value)}
              className={
                !minQtyWarning || !stockEnabled
                  ? "form-pill__stock-qtys-input input--no-av input-min-qty-product"
                  : "form-pill__stock-qtys-input input-min-qty-product"
              }
            />
          </div>
        </div>
      </div>
      <div className="form-btns">
        <p className="form-pill__hint">(*) Campos obligatorios.</p>
        <div className="form-btns__div">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="secondary-btn form-btns__btn form-btns__btn-cancel"
          >
            Cancelar
          </button>
          <button
            className="btn form-btns__btn form-btns__btn-save"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <FaSpinner className="action-icon spinner" />
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="inline-error form-inline-error" role="alert">
          {actionError}
        </div>
      )}

      <input
        type="hidden"
        name="_action"
        value={isEditing ? "update" : "create"}
      />
    </Form>
  );
}
