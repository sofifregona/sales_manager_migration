import { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, } from "../services/employeeService.js";
import { AppError } from "../errors/AppError.js";
export const createEmployeeHandler = async (req, res) => {
    try {
        const employee = await createEmployee(req.body);
        res.status(201).json(employee);
    }
    catch (error) {
        console.error("Error al intentar crear el proveedor: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const updateEmployeeHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const updated = await updateEmployee({ id, ...req.body });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error("Error al intentar modificar el empleado: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const deactivateEmployeeHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const employee = await updateEmployee({ id, active: false });
        res.status(200).json(employee);
    }
    catch (error) {
        console.error("Error al intentar dar de baja el empleado: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getAllEmployeesHandler = async (_req, res) => {
    try {
        const employees = await getAllEmployees();
        res.status(200).json(employees);
    }
    catch (error) {
        console.error("Error al intentar acceder a la lista de empleados: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
export const getEmployeeByIdHandler = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const employee = await getEmployeeById(id);
        res.status(200).json(employee);
    }
    catch (error) {
        console.error("Error al intentar acceder al empleado: ", error);
        const isAppError = error instanceof AppError && error.statusCode;
        const status = isAppError ? error.statusCode : 500;
        const message = isAppError ? error.message : "Ocurrió un error inesperado";
        res.status(status).json({ message });
    }
};
