import { redirect } from "react-router";
import { API_BASE_URL } from "~/config/api";

// Client-side loader to ensure browser cookies (sid) are sent
export async function clientLoader({ request }: { request: Request }) {
  try {
    const meUrl = `${API_BASE_URL}/auth/me`;
    const res = await fetch(meUrl, {
      method: "GET",
      credentials: "include",
    });
    console.log("clientLoader me status:", res.status);
    if (!res.ok) {
      const url = new URL(request.url);
      throw redirect(`/login?next=${encodeURIComponent(url.pathname)}`);
    }
    return null;
  } catch (e) {
    console.error("clientLoader error:", e);
    const url = new URL(request.url);
    throw redirect(`/login?next=${encodeURIComponent(url.pathname)}`);
  }
}

