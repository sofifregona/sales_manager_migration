// VALIDACIONES DE ID
export function validateRequiredID(id: string | undefined, field: string) {
  return typeof id !== "string" || id.trim() === ""
    ? { error: `${field}: Falta el ID.`, source: "client" }
    : null;
}

export function validateFilteredID(id: number, field: string) {
  return id === -1
    ? {
        error: `${field}: Opción no válida. Seleccione una opción de la lista.`,
        source: "client",
      }
    : null;
}

export function validateNumberID(id: number, field: string) {
  return Number.isNaN(id) || id <= 0 || !Number.isInteger(id)
    ? { error: `${field}: ID inválido`, source: "client" }
    : null;
}

// VALIDACIONES GENÉRICAS
export function validateRequired(value: unknown, field: string) {
  return value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
    ? { error: `${field}: El campo es obligatorio`, source: "client" }
    : null;
}

export function validateType(value: unknown, type: string, field: string) {
  return typeof value === type
    ? null
    : { error: `${field}: Formato no válido`, source: "client" };
}

export function validateRequiredAndType(
  value: unknown,
  field: string,
  type: string
) {
  return runValidations(
    validateRequired(value, field),
    validateType(value, type, field)
  );
}

// VALIDACIONES NUMÉRICAS
export function validateNumber(value: number, field: string) {
  return Number.isNaN(value)
    ? { error: `${field}: Debe ingresar un número válido.`, source: "client" }
    : null;
}

export function validateIsInteger(value: number, field: string) {
  return !Number.isInteger(value)
    ? { error: `${field}: El número debe ser entero.`, source: "client" }
    : null;
}

export function validateIsPositive(value: number, field: string) {
  return value < 0
    ? {
        error: `${field}: El número debe ser mayor de o igual a 0`,
        source: "client",
      }
    : null;
}

export function validatePositiveNumber(num: number, field: string) {
  return runValidations(
    validateNumber(num, field),
    validateIsPositive(num, field)
  );
}

export function validatePositiveInteger(num: number, field: string) {
  return runValidations(
    validatePositiveNumber(num, field),
    validateIsInteger(num, field)
  );
}

// VALIDACIONES STRING
export function validateExactLength(
  value: string,
  length: number,
  field: string
) {
  return value.trim().length !== length
    ? {
        error: `${field}: La longitud debe ser de exactamente ${length} caracteres.`,
        source: "client",
      }
    : null;
}

export function validateRangeLength(
  value: string,
  min: number,
  max: number,
  field: string
) {
  return value.trim().length < min || value.length > max
    ? {
        error: `${field}: La longitud debe ser de entre ${min} y ${max} caracteres.`,
        source: "client",
      }
    : null;
}

//VALIDACIONES DE LISTAS
export function validateNoEmptyList(value: any[], field: string) {
  return value.length === 0
    ? {
        error: `Lista de ${field}: La lista se encuentra vacía`,
        source: "client",
      }
    : null;
}

//FUNCTION PARA VARIAS VALIDACIONES
export function runValidations(...results: (object | null)[]) {
  return results.find((error) => error !== null) || null;
}
