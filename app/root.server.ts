import type { LoaderFunctionArgs } from "react-router";
import { API_BASE_URL } from "~/config/api";
import { runWithRequest } from "~/lib/http/requestContext.server";
import { fetchJson } from "~/lib/http/fetchJson.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return runWithRequest(request, async () => {
    try {
      const me = await fetchJson(`${API_BASE_URL}/auth/me`, { method: "GET" });
      return { user: me };
    } catch {
      return { user: null };
    }
  });
}


