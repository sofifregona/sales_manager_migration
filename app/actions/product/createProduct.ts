import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createProduct } from "~/api/product";
import type { CreateProductFormData } from "~/types/product";
import {
  validateFilteredID,
  validateNumberID,
  validatePositiveInteger,
  validatePositiveNumber,
  validateRangeLength,
  validateRequiredAndType,
  validateType,
} from "~/utils/validations/validationHelpers";

export async function createProductAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  // Validations for code (input)
  let codeStr = formData.get("code");
  const codeStrError = validateRequiredAndType(codeStr, "Código", "string");
  if (codeStrError) return codeStrError;
  codeStr = (codeStr as string).trim();
  const codeLengthError = validateRangeLength(codeStr, 1, 3, "Código");
  if (codeLengthError) return codeLengthError;

  // Validations for code (parsed)
  const code = Number(codeStr);
  const codeError = validatePositiveInteger(code, "Código");
  if (codeError) return codeError;

  // Validations for price (input)
  const priceStr = formData.get("price");
  const priceStrError = validateRequiredAndType(priceStr, "Precio", "string");
  if (priceStrError) return priceStrError;

  // Validations for price (parsed)
  const price = Number(priceStr);
  const ErrorPrice = validatePositiveNumber(price, "Precio");
  if (ErrorPrice) return ErrorPrice;

  let idBrand: number | null = null;
  let idCategory: number | null = null;
  let idProvider: number | null = null;

  const brandStr = formData.get("idBrand");
  if (brandStr && brandStr !== "") {
    const typeBrandId = validateType(brandStr, "string", "Marca");
    if (typeBrandId) return typeBrandId;
    const brandNumId = Number(brandStr);
    const brandFilteredId = validateFilteredID(brandNumId, "Marca");
    if (brandFilteredId) return brandFilteredId;
    const validBrandId = validateNumberID(brandNumId, "Marca");
    if (validBrandId) return validBrandId;
    idBrand = brandNumId;
  }

  const categoryStr = formData.get("idCategory");
  if (categoryStr && categoryStr !== "") {
    const typeCategoryId = validateType(categoryStr, "string", "Categoría");
    if (typeCategoryId) return typeCategoryId;
    const categoryNumId = Number(categoryStr);
    const categoryFilteredId = validateFilteredID(categoryNumId, "Categoría");
    if (categoryFilteredId) return categoryFilteredId;
    const validCategoryId = validateNumberID(categoryNumId, "Categoría");
    if (validCategoryId) return validCategoryId;
    idCategory = categoryNumId;
  }

  const providerStr = formData.get("idProvider");
  if (providerStr && providerStr !== "") {
    const typeProviderId = validateType(providerStr, "string", "Proveedor");
    if (typeProviderId) return typeProviderId;
    const providerNumId = Number(providerStr);
    const providerFilteredId = validateFilteredID(providerNumId, "Proveedor");
    if (providerFilteredId) return providerFilteredId;
    const validProviderId = validateNumberID(providerNumId, "Proveedor");
    if (validProviderId) return validProviderId;
    idProvider = providerNumId;
  }

  const data: CreateProductFormData = {
    name: name as string,
    code: code,
    price: price,
    idBrand: idBrand,
    idCategory: idCategory,
    idProvider: idProvider,
  };

  try {
    await createProduct(data);
    return redirect("/product/create-success");
  } catch (error) {
    let parsed = { message: "Error al crear el producto", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
