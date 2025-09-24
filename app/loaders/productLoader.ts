import type { LoaderFunctionArgs } from "react-router";
import { getListOfProducts, getProductById } from "~/api/product";
import { getAllProviders } from "~/api/provider";
import { getAllBrands } from "~/api/brand";
import { getAllCategories } from "~/api/category";
import {
  validateRequiredID,
  validateNumberID,
} from "~/utils/validations/validationHelpers";

export async function productListLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const filters = {
    name: url.searchParams.get("name") ?? undefined,
    code: url.searchParams.get("code") ?? undefined,
    minPrice: url.searchParams.get("minPrice") ?? undefined,
    maxPrice: url.searchParams.get("maxPrice") ?? undefined,
    idProvider: url.searchParams.get("idProvider") ?? undefined,
    idBrand: url.searchParams.get("idBrand") ?? undefined,
    idCategory: url.searchParams.get("idCategory") ?? undefined,
    sortField: url.searchParams.get("sortField") ?? "name",
    sortDirection:
      (url.searchParams.get("sortDirection") ?? "ASC").toUpperCase() === "DESC"
        ? "DESC"
        : "ASC",
  };

  try {
    const [providers, brands, categories, products] = await Promise.all([
      getAllProviders(),
      getAllBrands(),
      getAllCategories(),
      getListOfProducts(filters),
    ]);

    return { providers, brands, categories, products };
  } catch (error) {
    let parsed = {
      message: "Error al obtener la lista de productos",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
}

export const productLoader = async ({ params }: LoaderFunctionArgs) => {
  const idRequiredError = validateRequiredID(params.id, "PRODUCTO");
  if (idRequiredError) {
    throw new Error(idRequiredError.error);
  }

  const id = parseInt(params.id as string, 10);
  const idNumberError = validateNumberID(id, "PRODUCTO");
  if (idNumberError) {
    throw new Error(idNumberError.error);
  }

  try {
    const product = await getProductById(id);
    return product;
  } catch (error) {
    let parsed = { message: "Error al obtener el producto", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
};

export async function getProductDependenciesLoader() {
  try {
    const [providers, brands, categories] = await Promise.all([
      getAllProviders(),
      getAllBrands(),
      getAllCategories(),
    ]);
    return { providers, brands, categories };
  } catch (error) {
    let parsed = {
      message: "Error al obtener dependencias de producto",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
}

export async function productEditLoader(args: LoaderFunctionArgs) {
  const idRequiredError = validateRequiredID(args.params.id, "PRODUCTO");
  if (idRequiredError) throw new Error(idRequiredError.error);

  const id = parseInt(args.params.id as string, 10);
  const idNumberError = validateNumberID(id, "PRODUCTO");
  if (idNumberError) throw new Error(idNumberError.error);

  try {
    const [product, providers, brands, categories] = await Promise.all([
      getProductById(id),
      getAllProviders(),
      getAllBrands(),
      getAllCategories(),
    ]);
    return { product, providers, brands, categories };
  } catch (error) {
    let parsed = {
      message: "Error al cargar edición de producto",
      status: 500,
    };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {
      parsed.message = (error as Error).message;
    }
    throw new Error(parsed.message);
  }
}
