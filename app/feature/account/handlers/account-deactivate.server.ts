import { redirect } from "react-router-dom";
import { deactivateAccount } from "~/feature/account/account-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import { validateRequiredId } from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleDeactivateAccount({ url, formData }: Ctx) {
  const idParam = formData.get("id");
  const idReqError = validateRequiredId(idParam, "Cuenta");
  if (idReqError) return jsonResponse(422, idReqError);
  const idNum = Number(idParam);

  try {
    const strategy = formData.get("strategy")
      ? (String(formData.get("strategy")) as
          | "cascade-delete-payments"
          | "cancel")
      : undefined;
    await deactivateAccount(idNum, strategy);
    // setFlash({ scope: "account", kind: "deleted-success" });
    // const params = new URLSearchParams(url.search);
    // params.set("deactivated", "1");
    // return redirect(`/account?${params.toString()}`);
    const out = new URLSearchParams();
    out.set("deactivated", "1");
    if (url.searchParams.get("includeInactive") === "1")
      out.set("includeInactive", "1");
    return redirect(`/account?${out.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo eliminar la cuenta seleccionada."
    );
    if (parsed.status === 409 && (parsed as any).code === "ACCOUNT_IN_USE") {
      return jsonResponse(409, {
        error: parsed.message,
        code: (parsed as any).code,
        details: (parsed as any).details,
        source: parsed.source ?? "server",
      });
    }
    return jsonResponse(parsed.status ?? 500, {
      error: parsed.message,
      source: parsed.source ?? "server",
    });
  }
}
