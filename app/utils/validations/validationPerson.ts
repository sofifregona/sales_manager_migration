import {
  validateExactLength,
  validateRangeLength,
  runValidations,
  validatePositiveInteger,
} from "./validationHelpers";

export function validateCUI(cuit: number, field: string, length: number) {
  return runValidations(
    validatePositiveInteger(cuit, field),
    validateExactLength(String(cuit), length, field)
  );
}

export function validateTelephone(tel: number, field: string) {
  return runValidations(
    validatePositiveInteger(tel, field),
    validateRangeLength(tel.toString(), 6, 13, field)
  );
}

export function validateEmailFormat(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: `E-mail: Formato no válido.`,
      source: "client",
    };
  }
}
