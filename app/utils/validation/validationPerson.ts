import {
  validateExactLength,
  validateRangeLength,
  runValidations,
  validatePositiveInteger,
} from "./validationHelpers";

export function validateCUI(cuit: number, length: number, title: string) {
  return runValidations(
    validatePositiveInteger(cuit, title),
    validateExactLength(String(cuit), length, title)
  );
}

export function validateTelephone(tel: number, title: string) {
  return runValidations(
    validatePositiveInteger(tel, title),
    validateRangeLength(tel.toString(), 6, 13, title)
  );
}

export function validateEmailFormat(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: `(Error) E-mail: Formato no válido.`,
      source: "client",
    };
  }
}
