import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createBrand } from "~/api/brand";
import type { CreateBrandFormData } from "~/types/brand";
import {
  validateRequired,
  validateRequiredAndType,
} from "~/utils/validations/validationHelpers";

export async function createBrandAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  const data: CreateBrandFormData = { name: (name as string).trim() };

  try {
    await createBrand(data);
    return redirect("/brand/create-success");
  } catch (error) {
    let parsed = { message: "Error al crear la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
