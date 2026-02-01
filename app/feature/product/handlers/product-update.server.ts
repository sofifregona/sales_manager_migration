import { redirect } from "react-router-dom";
import { jsonResponse } from "~/lib/http/jsonResponse";
// import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateFilteredId,
  validateIsInteger,
  validateIsPositive,
  validateNumberId,
  validatePositiveInteger,
  validateRangeLength,
  validateRequired,
  validateRequiredId,
  validateType,
} from "~/utils/validation/validationHelpers";
import type { UpdateProductPayload } from "../product";
import { updateProduct } from "../product-api.server";

type Ctx = { url: URL; formData: FormData };

export async function handleProductUpdate({ url, formData }: Ctx) {
  const idParam = url.searchParams.get("id");

  // Required + string check for URL param
  const idReqError = validateRequiredId(idParam, "Producto");
  if (idReqError) {
    return jsonResponse(422, idReqError);
  }
  // Numeric (positive integer) check
  const id = Number(idParam);
  const idNumError = validateNumberId(id, "Producto");
  if (idNumError) {
    return jsonResponse(422, idNumError);
  }

  const nameParam = formData.get("name");
  // Required name: must be non-empty string
  const nameParamError = validateRequired(nameParam, "string", "Nombre");
  if (nameParamError) {
    return jsonResponse(422, nameParamError);
  }
  const name = nameParam!.toString().trim();

  const codeParam = formData.get("code");
  const codeParamError = validateRequired(codeParam, "string", "Código");
  if (codeParamError) {
    return jsonResponse(422, codeParamError);
  }
  const codeStr = codeParam!.toString().trim();
  const codeStrLengthError = validateRangeLength(codeStr, 1, 3, "Código");
  if (codeStrLengthError) {
    return jsonResponse(422, codeStrLengthError);
  }
  const code = Number(codeStr);
  const codeError = validatePositiveInteger(code, "Código");
  if (codeError) {
    return jsonResponse(422, codeError);
  }

  console.log("EN EL UPDATE");
  console.log(code);
  console.log(validateIsInteger(code, "Código"));
  const priceParam = formData.get("price");
  const priceParamError = validateRequired(priceParam, "string", "Precio");
  if (priceParamError) {
    return jsonResponse(422, priceParamError);
  }
  const priceStr = priceParam!.toString().trim();
  const price = Number(priceStr);
  const errorPrice = validateIsPositive(price, "Precio");
  if (errorPrice) {
    return jsonResponse(422, errorPrice);
  }

  let idBrand: number | null = null;
  const brandParam = formData.get("idBrand");
  if (brandParam) {
    const brandParamError = validateType(brandParam, "string", "Marca");
    if (brandParamError) {
      return jsonResponse(422, brandParamError);
    }
    const brandStr = brandParam.toString().trim();
    if (brandStr !== "") {
      const brandNum = Number(brandStr);
      const brandNumError = validateNumberId(brandNum, "Marca");
      if (brandNumError) {
        return jsonResponse(422, brandNumError);
      }
      const brandFilteredError = validateFilteredId(brandNum, "Marca");
      if (brandFilteredError) {
        return jsonResponse(422, brandFilteredError);
      }
      idBrand = brandNum;
    }
  }

  let idCategory: number | null = null;
  const categoryParam = formData.get("idCategory");
  if (categoryParam) {
    const categoryParamError = validateType(
      categoryParam,
      "string",
      "Categoría"
    );
    if (categoryParamError) {
      return jsonResponse(422, categoryParamError);
    }
    const categoryStr = categoryParam.toString().trim();
    if (categoryStr !== "") {
      const categoryNum = Number(categoryStr);
      const categoryNumError = validateNumberId(categoryNum, "Categoría");
      if (categoryNumError) {
        return jsonResponse(422, categoryNumError);
      }
      const categoryFilteredError = validateFilteredId(
        categoryNum,
        "Categoría"
      );
      if (categoryFilteredError) {
        return jsonResponse(422, categoryFilteredError);
      }
      idCategory = categoryNum;
    }
  }

  let idProvider: number | null = null;
  const providerParam = formData.get("idProvider");
  if (providerParam) {
    const providerParamError = validateType(
      providerParam,
      "string",
      "Proveedor"
    );
    if (providerParamError) {
      return jsonResponse(422, providerParamError);
    }
    const providerStr = providerParam.toString().trim();
    if (providerStr !== "") {
      const providerNum = Number(providerStr);
      const providerNumError = validateNumberId(providerNum, "Proveedor");
      if (providerNumError) {
        return jsonResponse(422, providerNumError);
      }
      const providerFilteredError = validateFilteredId(
        providerNum,
        "Proveedor"
      );
      if (providerFilteredError) {
        return jsonResponse(422, providerFilteredError);
      }
      idProvider = providerNum;
    }
  }

  let selectedSampleImage: string | null = null;
  const selectedSampleParam = formData.get("selectedSampleImage");
  if (selectedSampleParam !== null) {
    const selectedSampleError = validateType(
      selectedSampleParam,
      "string",
      "Imagen de muestra"
    );
    if (selectedSampleError) {
      return jsonResponse(422, selectedSampleError);
    }
    const sampleValue = selectedSampleParam.toString().trim();
    if (sampleValue) {
      selectedSampleImage = sampleValue;
    }
  }

  let imageFile: File | null = null;
  const imageParam = formData.get("image");
  if (imageParam !== null) {
    const imageParamError = validateType(imageParam, "object", "Imagen");
    if (imageParamError) {
      return jsonResponse(422, imageParamError);
    }
    if (imageParam instanceof File && imageParam.size > 0) {
      imageFile = imageParam;
    }
  }

  const stockEnabled = Boolean(formData.get("stockEnabled"));

  const quantity = Number(formData.get("quantity"));
  const quantityError = validatePositiveInteger(quantity, "Cantidad");
  if (quantityError) return jsonResponse(422, quantityError);

  const negativeQuantityWarning = Boolean(
    formData.get("negativeQuantityWarning")
  );

  const minQuantityWarning = Boolean(formData.get("minQuantityWarning"));

  const minQuantity = Number(formData.get("minQuantity"));
  const minQuantityError = validatePositiveInteger(
    minQuantity,
    "Cantidad mínima"
  );
  if (minQuantityError) return minQuantityError;

  const payload: UpdateProductPayload = {
    id,
    name,
    code,
    price,
    idCategory,
    idBrand,
    idProvider,
    stockEnabled,
    quantity,
    negativeQuantityWarning,
    minQuantityWarning,
    minQuantity,
  };

  try {
    await updateProduct(payload, {
      selectedSampleImage,
      imageFile,
    });

    const p = new URLSearchParams(url.search);
    ["id", "conflict", "code", "elementId", "message"].forEach((k) =>
      p.delete(k)
    );
    p.set("updated", "1");
    return redirect(`/settings/product?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo modificar el producto seleccionado."
    );

    if (parsed.status === 409) {
      return jsonResponse(409, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
