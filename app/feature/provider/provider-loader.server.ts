import type { LoaderFunctionArgs } from "react-router";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { getAllProviders, getProviderById } from "./provider-api.server";
import type { ProviderDTO, ProviderLoaderData } from "./provider";
import type { Flash } from "~/types/flash";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

export async function providerLoader({
  request,
}: LoaderFunctionArgs): Promise<ProviderLoaderData> {
  return runWithRequest(request, async () => {
    const url = new URL(request.url);
    const flash: Flash = {} as Flash;

    const includeInactive = url.searchParams.get("includeInactive") === "1";

    let providers: ProviderDTO[] | null = null;
    try {
      providers = await getAllProviders(includeInactive);
    } catch (error) {
      const parsed = parseAppError(
        error,
        "(Error) No se pudo obtener la lista de proveedores."
      );
      throw jsonResponse(parsed.status ?? 500, {
        error: parsed.message,
        source: parsed.source ?? "server",
      });
    }

    const idParam = url.searchParams.get("id");
    let editingProvider: ProviderDTO | null = null;

    if (idParam) {
      const idRequiredError = validateRequiredId(idParam, "Proveedor");
      if (idRequiredError) {
        flash.error = idRequiredError.error;
        flash.source = idRequiredError.source;
        return { providers, editingProvider, flash };
      }

      const id = parseInt(idParam as string, 10);
      try {
        editingProvider = await getProviderById(id);
      } catch (error) {
        const parsed = parseAppError(
          error,
          "(Error) No se pudo cargar el proveedor seleccionado."
        );
        flash.error = parsed.message;
        flash.source = parsed.source;
        editingProvider = null;
      }
    }
    return { providers, editingProvider, flash };
  });
}
