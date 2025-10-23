import { redirect } from "react-router-dom";
import { reactivateAccountSwap } from "~/feature/account/account-api.server";
import { jsonResponse } from "~/lib/http/jsonResponse";
import { setFlash } from "~/services/flashSession";
import { parseAppError } from "~/utils/errors/parseAppError";
import {
  validateNumberId,
  validateRequiredId,
} from "~/utils/validation/validationHelpers";

type Ctx = { url: URL; formData: FormData };

export async function handleReactivateSwapAccount({ url, formData }: Ctx) {
  const currentIdParam = formData.get("currentId");
  const currentIdReqError = validateRequiredId(currentIdParam, "Cuenta actual");
  if (currentIdReqError) return jsonResponse(422, currentIdReqError);
  const currentIdNum = Number(currentIdParam);

  const inactiveIdParam = formData.get("inactiveId");
  const inactiveIdReqError = validateRequiredId(
    inactiveIdParam,
    "Cuenta inactiva"
  );
  if (inactiveIdReqError) return jsonResponse(422, inactiveIdReqError);
  const inactiveIdNum = Number(inactiveIdParam);

  const strategyParam = formData.get("strategy");
  const strategy = strategyParam
    ? (String(strategyParam) as "cascade-delete-payments" | "cancel")
    : undefined;
  try {
    await reactivateAccountSwap(inactiveIdNum, currentIdNum, strategy);
    // setFlash({ scope: "account", kind: "reactivated-success" });
    // const params = new URLSearchParams(url.search);
    // params.set("reactivated", "1");
    // ["conflict", "code", "message", "name", "description", "elementId"].forEach(
    //   (k) => params.delete(k)
    // );
    // params.delete("id");
    // return redirect(`/account?${params.toString()}`);
    const out = new URLSearchParams();
    out.set("reactivated", "1");
    if (url.searchParams.get("includeInactive") === "1")
      out.set("includeInactive", "1");
    return redirect(`/account?${out.toString()}`);
  } catch (error) {
    const parsed = parseAppError(
      error,
      "(Error) No se pudo reactivar la cuenta intercambiando los estados."
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
