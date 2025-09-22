import { createProvider, getAllProviders, getProviderById, updateProvider, } from "../services/providerService.js";
import { AppError } from "../errors/AppError.js";
export const createProviderHandler = async (req, res) => {
    try {
        const provider = await createProvider(req.body);
        res.status(201).json(provider);
    }
    catch (error) {
        console.error("Error al intentar crear el proveedor: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const updateProviderHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const updated = await updateProvider({ id, ...req.body });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error("Error al intentar modificar el proveedor: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const deactivateProviderHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const provider = await updateProvider({ id, active: false });
        res.status(200).json(provider);
    }
    catch (error) {
        console.error("Error al intentar dar de baja el proveedor: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getAllProvidersHandler = async (_req, res) => {
    try {
        const providers = await getAllProviders();
        res.status(200).json(providers);
    }
    catch (error) {
        console.error("Error al intentar acceder a la lista de proveedores: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getProviderByIdHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const provider = await getProviderById(id);
        res.status(200).json(provider);
    }
    catch (error) {
        console.error("Error al intentar acceder al proveedor: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
