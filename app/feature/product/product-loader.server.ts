import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { getListOfProducts, getProductById } from "./product-api.server";
import { getAllProviders } from "../provider/provider-api.server";
import { getAllBrands } from "../brand/brand-api.server";
import { getAllCategories } from "../category/category-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import type { Flash } from "~/types/flash";
import {
  validateRequiredId,
  validateNumberId,
} from "~/utils/validation/validationHelpers";
import type { ProductDTO, ProductLoaderData } from "./product";
import type { ProviderDTO } from "~/feature/provider/provider";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";

export async function productLoader({
  request,
}: LoaderFunctionArgs): Promise<ProductLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {} as Flash;
    const includeInactive = url.searchParams.get("includeInactive") === "1";

    let providers: ProviderDTO[] | null = null;
    let brands: BrandDTO[] | null = null;
    let categories: CategoryDTO[] | null = null;
    try {
      [providers, brands, categories] = await Promise.all([
        getAllProviders(),
        getAllBrands(),
        getAllCategories(),
      ]);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de filtros."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    const idParam = url.searchParams.get("id");
    let products: ProductDTO[] | null = null;
    const filters = {
      includeInactive,
      name: url.searchParams.get("name") ?? undefined,
      code: url.searchParams.get("code") ?? undefined,
      minPrice: url.searchParams.get("minPrice") ?? undefined,
      maxPrice: url.searchParams.get("maxPrice") ?? undefined,
      idProvider: url.searchParams.get("idProvider") ?? undefined,
      idBrand: url.searchParams.get("idBrand") ?? undefined,
      idCategory: url.searchParams.get("idCategory") ?? undefined,
      sortField: url.searchParams.get("sortField") ?? "name",
      sortDirection:
        (url.searchParams.get("sortDirection") ?? "asc").toLowerCase() ===
        "desc"
          ? "desc"
          : "asc",
    };

    try {
      products = await getListOfProducts(filters);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de productos."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    let editingProduct: ProductDTO | null = null;
    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Producto");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return {
          brands,
          categories,
          providers,
          products,
          editingProduct,
          flash,
        };
      }

      const id = parseInt(idParam as string, 10);
      const idError = validateNumberId(id, "Producto");
      if (idError) {
        flash.error = idError.error;
        flash.source = idError.source;
        return {
          brands,
          categories,
          providers,
          products,
          editingProduct,
          flash,
        };
      }

      try {
        editingProduct = await getProductById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar el producto seleccionado."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingProduct = null;
      }
    }
    return { brands, categories, providers, products, editingProduct, flash };
  });
}
