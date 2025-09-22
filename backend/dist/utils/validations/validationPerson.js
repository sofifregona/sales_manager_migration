import { validateExactLength, validateIsInteger, validateIsPositive, validateNumber, validateRangeLength, } from "./validationHelpers.js";
import { AppError } from "../../errors/AppError.js";
export function validateCUI(cuit, length) {
    validateNumber(cuit);
    validateIsInteger(cuit);
    validateIsPositive(cuit);
    validateExactLength(cuit, length, "cuit");
}
export function validateTelephone(tel) {
    validateNumber(tel);
    validateIsInteger(tel);
    validateIsPositive(tel);
    validateRangeLength(tel, 6, 13, "teléfono");
}
export function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError("Formato de email inválido", 400);
    }
}
