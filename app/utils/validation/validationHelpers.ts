type ValidationError = { error: string; source: "client" | "server" };

// VALIDACIONES DE ID
export function validateRequiredId(
  id: unknown,
  title: string
): ValidationError | null {
  if (typeof id !== "string" || id.trim() === "") {
    return {
      error: `(Error) ${title}: Formato de ID inválido.`,
      source: "client",
    };
  }
  validateNumberId(Number(id), title);
  return null;
}

export function validateNumberId(
  id: number,
  title: string
): ValidationError | null {
  if (Number.isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    return { error: `(Error) ${title}: ID inválido.`, source: "client" };
  }
  return null;
}

export function validateFilteredId(
  id: number,
  title: string
): ValidationError | null {
  if (id === -1) {
    return {
      error: `(Error) ${title}: Opción no válida. Seleccione una opción de la lista.`,
      source: "client",
    };
  }
  return null;
}

// VALIDACIONES GENÉRICAS
export function validateRequired(
  value: unknown,
  type: string,
  title: string
): ValidationError | null {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return { error: `(Error) ${title} es obligatorio/a.`, source: "client" };
  }
  if (type === "number") {
    value = Number(value);
  }
  if (type === "boolean") {
    value = Boolean(value);
  }
  validateType(value, type, title);
  return null;
}

export function validateType(
  value: unknown,
  type: string,
  title: string
): ValidationError | null {
  if (typeof value !== type) {
    return { error: `(Error) ${title}: Formato inválido.`, source: "client" };
  }
  return null;
}

// VALIDACIONES NUMÉRICAS
export function validateNumber(
  value: number,
  title: string
): ValidationError | null {
  if (Number.isNaN(value)) {
    return {
      error: `(Error) ${title}: Número inválido.`,
      source: "client",
    };
  }
  return null;
}

export function validateIsInteger(
  value: number,
  title: string
): ValidationError | null {
  validateNumber(value, title);
  if (!Number.isInteger(value)) {
    return {
      error: `(Error) ${title}: El número debe ser entero.`,
      source: "client",
    };
  }
  return null;
}

export function validateIsPositive(
  value: number,
  title: string
): ValidationError | null {
  validateNumber(value, title);
  if (value < 0) {
    return {
      error: `(Error) ${title}: El número debe ser mayor o igual a 0.`,
      source: "client",
    };
  }
  return null;
}

export function validatePositiveInteger(num: number, title: string) {
  return runValidations(
    validateIsPositive(num, title),
    validateIsInteger(num, title)
  );
}

// VALIDACIONES STRING
export function validateExactLength(
  value: string,
  length: number,
  title: string
): ValidationError | null {
  if (value.trim().length !== length) {
    return {
      error: `(Error) ${title}: La longitud debe ser de exactamente ${length} caracteres.`,
      source: "client",
    };
  }
  return null;
}

export function validateRangeLength(
  value: string,
  min: number,
  max: number,
  title: string
): ValidationError | null {
  if (value.trim().length < min || value.length > max) {
    return {
      error: `(Error) ${title}: La longitud debe ser de entre ${min} y ${max} caracteres.`,
      source: "client",
    };
  }
  return null;
}

//VALIDACIONES DE LISTAS
export function validateNoEmptyList(
  value: any[],
  title: string
): ValidationError | null {
  if (value.length === 0) {
    return {
      error: `(Error) Lista de ${title}: La lista se encuentra vacía.`,
      source: "client",
    };
  }
  return null;
}

//FUNCTION PARA VARIAS VALIDACIONES
export function runValidations(...results: (ValidationError | null)[]) {
  return results.find((error) => error !== null) || null;
}
