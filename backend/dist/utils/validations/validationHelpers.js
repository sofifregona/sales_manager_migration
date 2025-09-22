import { AppError } from "../../errors/AppError.js";
// VALIDACIONES DE ID
export function validateNumberID(id) {
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
        console.log(Number.isNaN(id));
        console.log(!Number.isInteger(id));
        throw new AppError("ID inválido", 400);
    }
}
// VALIDACIONES NUMÉRICAS
export function validateNumber(value) {
    if (Number.isNaN(value)) {
        throw new AppError("Debe ingresar un número válido.", 400);
    }
}
export function validateIsInteger(value) {
    if (!Number.isInteger(value)) {
        throw new AppError("El número debe ser entero.", 400);
    }
}
export function validateIsPositive(value) {
    if (value < 0) {
        throw new AppError("El número debe ser mayor o igual a 0.", 400);
    }
}
export function validatePositiveNumber(num) {
    validateNumber(num), validateIsPositive(num);
}
export function validatePositiveInteger(num) {
    validatePositiveNumber(num), validateIsInteger(num);
}
// VALIDACIONES DE LONGITUD
export function validateExactLength(value, length, field) {
    const stringValue = value.toString();
    if (stringValue.length !== length) {
        throw new AppError(`La longitud de ${field} debe ser de exactamente ${length} caracteres.`, 400);
    }
}
export function validateRangeLength(value, min, max, field) {
    const stringValue = value.toString();
    if (stringValue.length < min || stringValue.length > max) {
        throw new AppError(`La longitud de ${field} debe ser de entre ${min} y ${max} caracteres.`, 400);
    }
}
// OTRAS VALIDACIONES
export function validateParamFromList(param, list) {
    return list.includes(param);
}
