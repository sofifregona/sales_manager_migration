import { redirect } from "react-router";
import type { Route } from "./+types/index-landing";

export function loader({}: Route.LoaderArgs) {
  return redirect("/sale/order");
}

export default function IndexLanding() {
  return null;
}
