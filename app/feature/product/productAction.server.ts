import { redirect, type ActionFunctionArgs } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  deactivateProduct,
  incrementProduct,
} from "~/feature/product/productApi.server";
import type {
  CreateProductPayload,
  IncrementPricePayload,
  UpdateProductPayload,
} from "~/feature/product/product";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateFilteredId,
  validateNoEmptyList,
  validateNumberId,
  validatePositiveInteger,
  validatePositiveNumber,
  validateRangeLength,
  validateRequiredAndType,
  validateRequiredId,
  validateType,
} from "~/utils/validation/validationHelpers";
import {
  validateCUI,
  validateEmailFormat,
  validateTelephone,
} from "~/utils/validation/validationPerson";
import { runWithRequest } from "~/lib/http/requestContext.server";

/**
 * Product action (create/update/delete) using PRG:
 * - On success: redirect to /product?{created|updated|deleted}=1 (flash handled in loader)
 * - On client validation errors: return 422 with JSON (shown via useActionData/fetcher.data)
 * - On server errors: return 5xx with JSON
 */

export async function productAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const formData = await request.formData();
    const intent = formData.get("_action");

    const intentError = validateRequiredAndType(intent, "string", "Acci�n");
    if (intentError) {
      return jsonResponse(422, {
        error: intentError.error,
        source: intentError.source,
      });
    }

    // Only allow explicit intents; treat anything else as a bad request
    if (
      !["create", "update", "delete", "increment"].includes(intent!.toString())
    ) {
      return jsonResponse(400, {
        error: "(Error) Acci�n no soportada.",
        source: "client",
      });
    }

    // 2) DELETE branch: id comes from the row's fetcher.Form (body), not the URL
    if (intent === "delete") {
      const idParam = formData.get("id");
      // Required + string check (rejects null/File/"")
      const idReqError = validateRequiredId(idParam, "Producto");
      if (idReqError) {
        return jsonResponse(422, {
          error: idReqError.error,
          source: idReqError.source,
        });
      }
      // Numeric (positive integer) check
      const idNum = Number(idParam);
      const idNumError = validateNumberId(idNum, "Producto");
      if (idNumError) {
        return jsonResponse(422, {
          error: idNumError.error,
          source: idNumError.source,
        });
      }

      try {
        await deactivateProduct(idNum);

        // Success → PRG + flash in loader
        return redirect("/product?deleted=1");
      } catch (error) {
        // Server error → return 5xx JSON for inline display
        const parsed = parseAppError(
          error,
          "(Error) No se pudo eliminar el producto seleccionado."
        );
        return jsonResponse(parsed.status ?? 500, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }

    if (intent === "increment") {
      const idsParams = formData.getAll("ids");
      const list: number[] = [];

      for (const idParam of idsParams) {
        const idReqError = validateRequiredId(idParam, "Producto");
        if (idReqError) {
          return jsonResponse(422, {
            error: idReqError.error,
            source: idReqError.source,
          });
        }
        // Numeric (positive integer) check
        const idNum = Number(idParam);
        const idNumError = validateNumberId(idNum, "Producto");
        if (idNumError) {
          return jsonResponse(422, {
            error: idNumError.error,
            source: idNumError.source,
          });
        }
        list.push(idNum);
      }

      const ids = [...new Set(list)];
      const emptyListError = validateNoEmptyList(ids, "Productos");
      if (emptyListError) {
        return jsonResponse(422, {
          error: emptyListError.error,
          source: emptyListError.source,
        });
      }

      // Validations for price (input)
      const percentStr = formData.get("percent");
      const percentStrError = validateRequiredAndType(
        percentStr,
        "string",
        "Porcentaje"
      );
      if (percentStrError) {
        return jsonResponse(422, {
          error: percentStrError.error,
          source: percentStrError.source,
        });
      }
      // Validations for price (parsed)
      const percent = Number(percentStr);
      const percentError = validatePositiveInteger(percent, "Porcentaje");
      if (percentError) {
        return jsonResponse(422, {
          error: percentError.error,
          source: percentError.source,
        });
      }

      const data: IncrementPricePayload = {
        ids,
        percent,
      };

      try {
        await incrementProduct(data);
        return redirect("/product?incremented=1");
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudieron actualizar los precios."
        );
        return jsonResponse(parsed.status ?? 500, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }

    // 3) Shared form field for create/update (top form)
    const nameParam = formData.get("name");
    // Required name: must be non-empty string
    const nameParamError = validateRequiredAndType(
      nameParam,
      "string",
      "Nombre"
    );
    if (nameParamError) {
      return jsonResponse(422, {
        error: nameParamError.error,
        source: nameParamError.source,
      });
    }
    const name = nameParam!.toString().trim();

    const codeParam = formData.get("code");
    const codeParamError = validateRequiredAndType(
      codeParam,
      "string",
      "C�digo"
    );
    if (codeParamError) {
      return jsonResponse(422, {
        error: codeParamError.error,
        source: codeParamError.source,
      });
    }
    const codeStr = codeParam!.toString().trim();
    const codeStrLengthError = validateRangeLength(codeStr, 1, 3, "C�digo");
    if (codeStrLengthError) {
      return jsonResponse(422, {
        error: codeStrLengthError.error,
        source: codeStrLengthError.source,
      });
    }
    const code = Number(codeStr);
    const codeError = validatePositiveInteger(code, "C�digo");
    if (codeError) {
      return jsonResponse(422, {
        error: codeError.error,
        source: codeError.source,
      });
    }

    const priceParam = formData.get("price");
    const priceParamError = validateRequiredAndType(
      priceParam,
      "string",
      "Precio"
    );
    if (priceParamError) {
      return jsonResponse(422, {
        error: priceParamError.error,
        source: priceParamError.source,
      });
    }
    const priceStr = priceParam!.toString().trim();
    const price = Number(priceStr);
    const errorPrice = validatePositiveNumber(price, "Precio");
    if (errorPrice) {
      return jsonResponse(422, {
        error: errorPrice.error,
        source: errorPrice.source,
      });
    }

    let idBrand: number | null = null;
    const brandParam = formData.get("idBrand");
    if (brandParam) {
      const brandParamError = validateType(brandParam, "string", "Marca");
      if (brandParamError) {
        return jsonResponse(422, {
          error: brandParamError.error,
          source: brandParamError.source,
        });
      }
      const brandStr = brandParam.toString().trim();
      if (brandStr !== "") {
        const brandNum = Number(brandStr);
        const brandNumError = validateNumberId(brandNum, "Marca");
        if (brandNumError) {
          return jsonResponse(422, {
            error: brandNumError.error,
            source: brandNumError.source,
          });
        }
        const brandFilteredError = validateFilteredId(brandNum, "Marca");
        if (brandFilteredError) {
          return jsonResponse(422, {
            error: brandFilteredError.error,
            source: brandFilteredError.source,
          });
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
        "Categor��a"
      );
      if (categoryParamError) {
        return jsonResponse(422, {
          error: categoryParamError.error,
          source: categoryParamError.source,
        });
      }
      const categoryStr = categoryParam.toString().trim();
      if (categoryStr !== "") {
        const categoryNum = Number(categoryStr);
        const categoryNumError = validateNumberId(categoryNum, "Categor��a");
        if (categoryNumError) {
          return jsonResponse(422, {
            error: categoryNumError.error,
            source: categoryNumError.source,
          });
        }
        const categoryFilteredError = validateFilteredId(
          categoryNum,
          "Categor�a"
        );
        if (categoryFilteredError) {
          return jsonResponse(422, {
            error: categoryFilteredError.error,
            source: categoryFilteredError.source,
          });
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
        return jsonResponse(422, {
          error: providerParamError.error,
          source: providerParamError.source,
        });
      }
      const providerStr = providerParam.toString().trim();
      if (providerStr !== "") {
        const providerNum = Number(providerStr);
        const providerNumError = validateNumberId(providerNum, "Proveedor");
        if (providerNumError) {
          return jsonResponse(422, {
            error: providerNumError.error,
            source: providerNumError.source,
          });
        }
        const providerFilteredError = validateFilteredId(
          providerNum,
          "Proveedor"
        );
        if (providerFilteredError) {
          return jsonResponse(422, {
            error: providerFilteredError.error,
            source: providerFilteredError.source,
          });
        }
        idProvider = providerNum;
      }
    }

    // 4) CREATE branch: there must be NO id in URL (mode = create)
    if (intent === "create") {
      const newData: CreateProductPayload = {
        name,
        code,
        price,
        idBrand,
        idCategory,
        idProvider,
      };

      try {
        await createProduct(newData);
        // Success → PRG + flash in loader
        return redirect("/product?created=1");
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo crear el producto."
        );
        return jsonResponse(parsed.status ?? 500, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }

    // 5) UPDATE branch: id comes from the URL query (?id=...), not from the form
    if (intent === "update") {
      const idParam = url.searchParams.get("id");

      // Required + string check for URL param
      const idReqError = validateRequiredId(idParam, "Producto");
      if (idReqError) {
        return jsonResponse(422, {
          error: idReqError.error,
          source: idReqError.source,
        });
      }
      // Numeric (positive integer) check
      const id = Number(idParam);
      const idNumError = validateNumberId(id, "Producto");
      if (idNumError) {
        return jsonResponse(422, {
          error: idNumError.error,
          source: idNumError.source,
        });
      }

      const updatedData: UpdateProductPayload = {
        id,
        name,
        code,
        price,
        idBrand,
        idCategory,
        idProvider,
      };

      try {
        await updateProduct(updatedData);
        // Success → PRG + flash in loader (also clears ?id)
        return redirect("/product?updated=1");
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo modificar el producto seleccionado."
        );
        return jsonResponse(parsed.status ?? 500, {
          error: parsed.message,
          source: parsed.source ?? "server",
        });
      }
    }
  });
}
