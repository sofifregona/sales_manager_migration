import { AppError } from "../../errors/AppError.js";

// VALIDACIONES DE ID
export function validateNumberID(id: number) {
  if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
    console.log(Number.isNaN(id));
    console.log(!Number.isInteger(id));
    throw new AppError("ID inválido", 400);
  }
}

// VALIDACIONES NUMÉRICAS
export function validateNumber(value: number) {
  if (Number.isNaN(value)) {
    throw new AppError("Debe ingresar un número válido.", 400);
  }
}

export function validateIsInteger(value: number) {
  if (!Number.isInteger(value)) {
    throw new AppError("El número debe ser entero.", 400);
  }
}

export function validateIsPositive(value: number) {
  if (value < 0) {
    throw new AppError("El número debe ser mayor o igual a 0.", 400);
  }
}

export function validatePositiveNumber(num: number) {
  validateNumber(num), validateIsPositive(num);
}

export function validatePositiveInteger(num: number) {
  validatePositiveNumber(num), validateIsInteger(num);
}

// VALIDACIONES DE LONGITUD
export function validateExactLength(
  value: string | number,
  length: number,
  field: string
) {
  const stringValue = value.toString();
  if (stringValue.length !== length) {
    throw new AppError(
      `La longitud de ${field} debe ser de exactamente ${length} caracteres.`,
      400
    );
  }
}

export function validateRangeLength(
  value: string | number,
  min: number,
  max: number,
  field: string
) {
  const stringValue = value.toString();
  if (stringValue.length < min || stringValue.length > max) {
    throw new AppError(
      `La longitud de ${field} debe ser de entre ${min} y ${max} caracteres.`,
      400
    );
  }
}

// OTRAS VALIDACIONES
export function validateParamFromList(param: string, list: string[]) {
  return list.includes(param);
}
