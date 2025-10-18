import { useRouteLoaderData } from "react-router";
import type { AuthUserDTO } from "~/feature/auth/auth";

export function useAuth(): AuthUserDTO | null {
  const data = useRouteLoaderData("root") as { user: AuthUserDTO | null } | undefined;
  return data?.user ?? null;
}
