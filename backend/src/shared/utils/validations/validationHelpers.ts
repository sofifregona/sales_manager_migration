import { AppError } from "../../errors/AppError.js";

// VALIDACIONES DE ID
export function validateNumberID(id: number, title: string) {
  if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
    throw new AppError(`(Error) ${title}: ID inválido.`, 400);
  }
}

// VALIDACIONES NUMÉRICAS
export function validateNumber(value: number, title: string) {
  if (Number.isNaN(value)) {
    throw new AppError(
      `(Error) ${title}: Debe ingresar un número válido.`,
      400
    );
  }
}

export function validateIsInteger(value: number, title: string) {
  if (!Number.isInteger(value)) {
    throw new AppError(`(Error) ${title}: El número debe ser entero.`, 400);
  }
}

export function validateIsPositive(value: number, title: string) {
  if (value < 0) {
    throw new AppError(
      `(Error) ${title}: El número debe ser mayor o igual a 0.`,
      400
    );
  }
}

export function validatePositiveNumber(num: number, title: string) {
  validateNumber(num, title), validateIsPositive(num, title);
}

export function validatePositiveInteger(num: number, title: string) {
  validatePositiveNumber(num, title), validateIsInteger(num, title);
}

// VALIDACIONES DE LONGITUD
export function validateExactLength(
  value: string | number,
  length: number,
  title: string
) {
  const stringValue = value.toString();
  if (stringValue.length !== length) {
    throw new AppError(
      `(Error) La longitud de ${title} debe ser de exactamente ${length} caracteres.`,
      400
    );
  }
}

export function validateRangeLength(
  value: string | number,
  min: number,
  max: number,
  title: string
) {
  const stringValue = value.toString();
  if (stringValue.length < min || stringValue.length > max) {
    throw new AppError(
      `(Error) La longitud de ${title} debe ser de entre ${min} y ${max} caracteres.`,
      400
    );
  }
}

// OTRAS VALIDACIONES
export function validateParamFromList(param: string, list: string[]) {
  return list.includes(param);
}
