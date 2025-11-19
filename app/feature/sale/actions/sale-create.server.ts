import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createSale } from "~/feature/sale/sale-api.server";
import type { CreateSalePayload } from "~/feature/sale/types/sale";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequired,
} from "~/utils/validation/validationHelpers";
import { runWithRequest } from "~/lib/http/requestContext.server";

export async function createSaleAction({ request }: ActionFunctionArgs) {
  return runWithRequest(request, async () => {
    const formData = await request.formData();

    // Validations for idProp (input)
    const propParam = formData.get("prop");
    const propParamError = validateRequired(
      propParam,
      "string",
      "Propietario de la venta"
    );
    if (propParamError) {
      return jsonResponse(422, propParamError);
    }
    const prop = propParam?.toString().trim();
    if (!["bartable", "employee"].includes(prop!)) {
      return jsonResponse(422, {
        error: "(Error) Designación de venta no soportada.",
        source: "client",
      });
    }

    let idBartable: number | null = null;
    let idEmployee: number | null = null;

    if (propParam === "bartable") {
      const idBartableStr = formData.get("idBartable");
      // Validations for idBartable (input) if exists
      const idBartableStrError = validateRequired(
        idBartableStr,
        "string",
        "ID Mesa"
      );
      if (idBartableStrError) {
        return jsonResponse(422, idBartableStrError);
      }

      // Validations for idBartable (number) if exists
      idBartable = Number(idBartableStr?.toString().trim());
      const idBartableError = validateNumberId(idBartable, "Mesa");
      if (idBartableError) {
        return jsonResponse(422, idBartableError);
      }
    } else if (propParam === "employee") {
      const idEmployeeStr = formData.get("idEmployee");

      // Validations for idEmployee (inputs) if exists
      const idEmployeeStrError = validateRequired(
        idEmployeeStr,
        "string",
        "ID Empleado"
      );
      if (idEmployeeStrError) {
        return jsonResponse(422, idEmployeeStrError);
      }

      // Validations for idEmployee (number) if exists
      idEmployee = Number(idEmployeeStr?.toString().trim());
      const idEmployeeError = validateNumberId(idEmployee, "Empleado");
      if (idEmployeeError) return idEmployeeError;
    } else {
      return jsonResponse(422, {
        error:
          "(Error) Propietario de la venta: La venta debe estar asociada a una mesa o a un empleado.",
        source: "client",
      });
    }

    const data: CreateSalePayload = {
      idBartable,
      idEmployee,
    };

    try {
      const newSale = await createSale(data);

      return redirect(`/sale/${newSale.id}/edit`);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo modificar la venta."
      );
      return jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }
  });
}
