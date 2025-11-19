import { redirect } from "react-router";
import { me } from "~/feature/auth/auth-api";
import { parseAppError } from "~/utils/errors/parseAppError";

// Client-side loader to ensure browser cookies (sid) are sent
export async function clientLoader({ request }: { request: Request }) {
  try {
    await me();
    return null;
  } catch (error) {
    const err = parseAppError(error, "No autenticado");
    const url = new URL(request.url);
    if (err.status === 401) {
      throw redirect(`/login?next=${encodeURIComponent(url.pathname)}`);
    }
    throw error;
  }
}
