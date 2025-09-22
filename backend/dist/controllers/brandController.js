import { createBrand, getAllBrands, getBrandById, updateBrand, } from "../services/brandService.js";
import { AppError } from "../errors/AppError.js";
export const createBrandHandler = async (req, res) => {
    try {
        const brand = await createBrand(req.body);
        res.status(201).json(brand);
    }
    catch (error) {
        console.error("Error al intentar crear la marca: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const updateBrandHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const updated = await updateBrand({ id, ...req.body });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error("Error al intentar modificar la marca: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const deactivateBrandHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const brand = await updateBrand({ id, active: false });
        res.status(200).json(brand);
    }
    catch (error) {
        console.error("Error al intentar dar de baja la marca: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getAllBrandsHandler = async (_req, res) => {
    try {
        const brands = await getAllBrands();
        res.status(200).json(brands);
    }
    catch (error) {
        console.error("Error al intentar acceder a la lista de marcas: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getBrandByIdHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const brand = await getBrandById(id);
        res.status(200).json(brand);
    }
    catch (error) {
        console.error("Error al intentar acceder a la marca: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
