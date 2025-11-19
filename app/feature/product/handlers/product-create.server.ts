import { redirect } from "react-router-dom";
import { createProduct } from "../product-api.server";
import type { CreateProductPayload } from "~/feature/product/product";
import { jsonResponse } from "~/lib/http/jsonResponse";
// import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateFilteredId,
  validateIsPositive,
  validateNumberId,
  validatePositiveInteger,
  validateRangeLength,
  validateRequired,
  validateRequiredId,
  validateType,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleProductCreate({ url, formData }: Ctx) {
  console.log("DENTRO DEL HANDLER");
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
      "CategorÃ­a"
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

  const payload: CreateProductPayload = {
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
    await createProduct(payload);

    const p = new URLSearchParams(url.search);
    // Limpiar posible id residual de ediciÃ³n y preservar filtro
    ["id", "conflict", "code", "elementId", "message"].forEach((k) =>
      p.delete(k)
    );
    p.set("created", "1");
    return redirect(`/product?${p.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo crear el producto."
    );
    // ReactivaciÃ³n no se hace desde create â†’ devolver inline, sin cookies ni URL de conflicto
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
