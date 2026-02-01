import { AppError } from "../../errors/AppError.js";

// VALIDACIONES DE ID
export function validateRequiredId(id: number, title: string) {
  if (typeof id !== "number") {
    throw new AppError(`(Error) ${title}: ID requerido.`, 400);
  }
  validateNumberID(id, title);
  return null;
}

export function validateNumberID(id: number, title: string) {
  if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
    throw new AppError(`(Error) ${title}: ID inválido.`, 400);
  }
}

export function validateRequiredAndType(
  value: unknown,
  type: string,
  title: string
) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    throw new AppError(`(Error) ${title} es obligatorio/a.`, 400);
  }
  validateType(value, type, title);
}

export function validateType(value: unknown, type: string, title: string) {
  console.log(value, type, typeof value !== type);
  if (typeof value !== type) {
    console.log("DENTRO DEL ERROR");
    throw new AppError(`(Error) ${title}: Formato inválido.`, 400);
  }
}

// VALIDACIONES NUMÉRICAS
export function validateNumber(value: number, title: string) {
  console.log("DENTRO DEL VALIDATE NUMBER");
  console.log(value);
  console.log(Number.isNaN(value));
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
  if (stringValue.normalize("NFC").length !== length) {
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
  if (
    stringValue.normalize("NFC").length < min ||
    stringValue.normalize("NFC").length > max
  ) {
    throw new AppError(
      `(Error) La longitud de ${title} debe ser de entre ${min} y ${max} caracteres.`,
      400
    );
  }
}

export function validateUsernameFormat(username: string) {
  const user = (username ?? "").trim();
  if (user === "") throw new AppError(`(Error) El usuario es requerido.`, 422);

  if (/\s/.test(user)) {
    throw new AppError(
      `(Error) El nombre de usuario no puede tener espacios.`,
      422
    );
  }

  // Solo ASCII alfanumérico y . _ -
  const re = /^[A-Za-z0-9._-]+$/;
  if (!re.test(user)) {
    throw new AppError(
      `(Error) Nombre de usuario inválido. Solo se permiten letras sin tildes, números y los caracteres . _ -`,
      422
    );
  }
}

// OTRAS VALIDACIONES
export function validateParamFromList(param: string, list: string[]) {
  return list.includes(param);
}
