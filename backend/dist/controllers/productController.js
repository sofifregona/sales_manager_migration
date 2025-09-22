import { createProduct, getListOfProducts, getProductById, updateProduct, incrementProduct, } from "../services/productService.js";
import { AppError } from "../errors/AppError.js";
export const createProductHandler = async (req, res) => {
    try {
        const product = await createProduct(req.body);
        res.status(201).json(product);
    }
    catch (error) {
        console.error("Error al intentar crear el producto: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const updateProductHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log("ESTAMOS DENTRO DEL UPDATE");
    try {
        const updated = await updateProduct({ id, ...req.body });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error("Error al intentar modificar el producto: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const incrementProductHandler = async (req, res) => {
    console.log("ESTAMOS DENTRO DEL INCREMENT");
    try {
        const incremented = await incrementProduct(req.body);
        res.status(200).json(incremented);
    }
    catch (error) {
        console.error("Error al intentar incrementar los precios de los productos: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const deactivateProductHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const product = await updateProduct({ id, active: false });
        res.status(200).json(product);
    }
    catch (error) {
        console.error("Error al intentar dar de baja el producto: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getListOfProductsHandler = async (req, res) => {
    const { name, code, minPrice, maxPrice, idBrand, idCategory, idProvider, sortField, sortDirection, } = req.query;
    try {
        const products = await getListOfProducts({
            name: name?.toString(),
            code: code?.toString(),
            minPrice: Number.isFinite(Number(minPrice)) && minPrice !== ""
                ? Number(minPrice)
                : undefined,
            maxPrice: Number.isFinite(Number(maxPrice)) && maxPrice !== ""
                ? Number(maxPrice)
                : undefined,
            idBrand: idBrand === "null" ? null : idBrand ? Number(idBrand) : undefined,
            idCategory: idCategory === "null"
                ? null
                : idCategory
                    ? Number(idCategory)
                    : undefined,
            idProvider: idProvider === "null"
                ? null
                : idProvider
                    ? Number(idProvider)
                    : undefined,
            sortField: sortField?.toString() || "name",
            sortDirection: sortDirection?.toString().toUpperCase() === "DESC" ? "DESC" : "ASC",
        });
        res.status(200).json(products);
    }
    catch (error) {
        console.error("Error al intentar acceder a la lista de productos: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getProductByIdHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const product = await getProductById(id);
        res.status(200).json(product);
    }
    catch (error) {
        console.error("Error al intentar acceder al proveedor: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
