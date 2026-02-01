import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "~/feature/product/product";

export type ProductImageOptions = {
  selectedSampleImage?: string | null;
  imageFile?: File | null;
};

const boolField = (value: boolean) => (value ? "on" : "");
const numberField = (value?: number | null) =>
  value === null || value === undefined ? "" : String(value);
const optionalIdField = (value?: number | null) =>
  value === null || value === undefined ? "" : String(value);

export const buildProductFormData = (
  data: CreateProductPayload | UpdateProductPayload,
  image?: ProductImageOptions
) => {
  const formData = new FormData();
  formData.set("name", data.name);
  formData.set("code", String(data.code));
  formData.set("price", String(data.price));
  formData.set("stockEnabled", boolField(Boolean(data.stockEnabled)));
  formData.set(
    "negativeQuantityWarning",
    boolField(Boolean(data.negativeQuantityWarning))
  );
  formData.set(
    "minQuantityWarning",
    boolField(Boolean(data.minQuantityWarning))
  );
  formData.set("quantity", numberField(data.quantity ?? null));
  formData.set("minQuantity", numberField(data.minQuantity ?? null));
  formData.set("idBrand", optionalIdField(data.idBrand ?? null));
  formData.set("idCategory", optionalIdField(data.idCategory ?? null));
  formData.set("idProvider", optionalIdField(data.idProvider ?? null));

  if (image?.selectedSampleImage) {
    formData.set("selectedSampleImage", image.selectedSampleImage);
  }

  if (image?.imageFile) {
    formData.set("image", image.imageFile);
  }

  return formData;
};
