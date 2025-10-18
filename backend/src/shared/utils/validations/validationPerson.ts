import {
  validateExactLength,
  validateIsInteger,
  validateIsPositive,
  validateNumber,
  validateRangeLength,
} from "./validationHelpers.js";

import { AppError } from "../../errors/AppError.js";

export function validateCUI(cuit: number, length: number, title: string) {
  validateNumber(cuit, title);
  validateIsInteger(cuit, title);
  validateIsPositive(cuit, title);
  validateExactLength(cuit, length, title);
}

export function validateTelephone(tel: number, title: string) {
  validateNumber(tel, title);
  validateIsInteger(tel, title);
  validateIsPositive(tel, title);
  validateRangeLength(tel, 6, 13, title);
}

export function validateEmailFormat(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError("(Error) E-mail: Formato inválido.", 400);
  }
}
