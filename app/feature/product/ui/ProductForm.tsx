import React, { useCallback, useEffect, useRef, useState } from "react";
import { Form, useLocation, useNavigation } from "react-router-dom";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProductDTO } from "~/feature/product/product";
import type { ProviderDTO } from "~/feature/provider/provider";
import { FilterableSelect } from "../../../shared/ui/form/FilterableSelect";
import sortAlphabetically from "~/utils/sorting/sortAlphabetically";

const sampleImages = [
  {
    id: "coffee",
    label: "Bebidas",
    url: "https://placehold.co/280x200/1a1a1a/d08d00?text=Bebidas",
  },
  {
    id: "burger",
    label: "Comida",
    url: "https://placehold.co/280x200/2f2f2f/f4f3ee?text=Comida",
  },
  {
    id: "dessert",
    label: "Postres",
    url: "https://placehold.co/280x200/383838/d08d00?text=Postre",
  },
];

const clearPreviewUrl = (url: string | null) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

type Props = {
  isEditing: boolean;
  editing?: ProductDTO | null;
  categories: CategoryDTO[];
  brands: BrandDTO[];
  providers: ProviderDTO[];
  formAction: string; // "." o `.${search}`
};

export function ProductForm({
  isEditing,
  editing,
  categories,
  brands,
  providers,
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

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [isImageOverlayOpen, setImageOverlayOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const location = useLocation();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const result = digits.replace(/^0+(?=[1-9])/, "").slice(0, 3);

    if (!digits) {
      setCode("");
    } else {
      setCode(result.padStart(3, "0"));
    }
  };

  const setNewImagePreview = useCallback((next: string | null) => {
    setImagePreview((current) => {
      if (current && current !== next) {
        clearPreviewUrl(current);
      }
      return next;
    });
  }, []);

  const openImageOverlay = () => setImageOverlayOpen(true);
  const closeImageOverlay = () => setImageOverlayOpen(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      handleClearImage();
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setNewImagePreview(previewUrl);
    setSelectedSample(null);
    closeImageOverlay();
  };

  const handleSampleSelect = (url: string) => {
    setNewImagePreview(url);
    setSelectedSample(url);
    closeImageOverlay();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualImageSelection = () => {
    closeImageOverlay();
    fileInputRef.current?.click();
  };

  const handleClearImage = useCallback(() => {
    setNewImagePreview(null);
    setSelectedSample(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPreviewUrl(imagePreview);
    };
  }, [imagePreview]);

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
      handleClearImage();
    }
  }, [isEditing, editing, handleClearImage]);

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
      handleClearImage();
    }
  }, [location.search, hasSuccess, isEditing, handleClearImage]);

  return (
    <>
      <Form
        method="post"
        action={formAction}
        className="product-form"
        encType="multipart/form-data"
        ref={formRef}
      >
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
        <label htmlFor="image">Imagen</label>
        <div className="product-form__image-field">
          <input
            ref={fileInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="product-form__file-input"
            onChange={handleFileChange}
          />
          <div className="product-form__image-actions">
            <button
              type="button"
              className="product-form__image-trigger"
              onClick={openImageOverlay}
            >
              Abrir galería
            </button>
            <button
              type="button"
              className="product-form__ghost-button"
              onClick={handleManualImageSelection}
            >
              Subir imagen
            </button>
          </div>
          {imagePreview ? (
            <div className="product-form__image-preview">
              <img
                src={imagePreview}
                alt="Previsualización de la imagen del producto"
              />
              <button
                type="button"
                className="product-form__clear-image"
                onClick={handleClearImage}
              >
                Quitar
              </button>
            </div>
          ) : (
            <p className="product-form__image-hint">
              Todavía no seleccionaste una imagen.
            </p>
          )}
        </div>
        <input
          type="hidden"
          name="selectedSampleImage"
          value={selectedSample ?? ""}
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

        <label htmlFor="stockEnabled">
          Habilitar registros de stock para este producto
        </label>
        <input
          type="checkbox"
          name="stockEnabled"
          checked={stockEnabled}
          onChange={(e) => setStockEnabled(e.currentTarget.checked)}
        />

        <label htmlFor="quantity">Cantidad inicial</label>
        <input
          id="quantity"
          type="number"
          name="quantity"
          value={quantity}
          step={1}
          min={0}
          disabled={!stockEnabled}
          onChange={(e) => setQuantity(e.currentTarget.value)}
        />

        <label htmlFor="negativeQtyWarning">
          Habilitar avisos de stock negativo
        </label>
        <input
          type="checkbox"
          name="negativeQtyWarning"
          checked={negativeQtyWarning}
          disabled={!stockEnabled}
          onChange={(e) => setNegativeQtyWarning(e.currentTarget.checked)}
        />

        <label htmlFor="minQtyWarning">Habilitar avisos de stock mínimo</label>
        <input
          type="checkbox"
          name="minQtyWarning"
          checked={minQtyWarning}
          disabled={!stockEnabled}
          onChange={(e) => setMinQtyWarning(e.currentTarget.checked)}
        />

        <label htmlFor="minQuantity">
          Cantidad mínima antes de mostrar un aviso
        </label>
        <input
          id="minQuantity"
          type="number"
          name="minQuantity"
          value={minQty}
          step={1}
          min={0}
          disabled={!minQtyWarning}
          onChange={(e) => setMinQty(e.currentTarget.value)}
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

      {isImageOverlayOpen && (
        <div
          className="product-form__image-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="product-form__image-overlay-content">
            <header className="product-form__image-overlay-header">
              <h3>Galer�a de im�genes</h3>
              <button
                type="button"
                className="product-form__ghost-button"
                onClick={closeImageOverlay}
                aria-label="Cerrar galer�a"
              >
                Cerrar
              </button>
            </header>
            <div className="product-form__image-grid">
              {sampleImages.map((sample) => (
                <button
                  type="button"
                  key={sample.id}
                  className="product-form__image-option"
                  onClick={() => handleSampleSelect(sample.url)}
                >
                  <img src={sample.url} alt={`Ejemplo ${sample.label}`} />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
            <div className="product-form__image-overlay-footer">
              <button type="button" onClick={handleManualImageSelection}>
                Subir imagen propia
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
