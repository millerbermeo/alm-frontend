import { redirect } from "next/navigation";

import { ROUTES } from "@/config/constants";

/** Entry — routing/auth is resolved by `proxy.ts` and the panel layout. */
export default function IndexPage() {
  redirect(ROUTES.dashboard);
}
