import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createCategory } from "~/api/category";
import type { CreateCategoryFormData } from "~/types/category";
import { validateRequiredAndType } from "~/utils/validations/validationHelpers";

export async function createCategoryAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Validations for name (input)
  const name = formData.get("name");
  const nameError = validateRequiredAndType(name, "Nombre", "string");
  if (nameError) return nameError;

  const data: CreateCategoryFormData = { name: (name as string).trim() };

  try {
    await createCategory(data);
    return redirect("/category/create-success");
  } catch (error) {
    let parsed = { message: "Error al crear la marca", status: 500 };
    try {
      parsed = JSON.parse((error as Error).message);
    } catch {}
    return { error: parsed.message, status: parsed.status, source: "server" };
  }
}
