import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/ui/logo";

interface Props {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared header/footer chrome for the login & register forms. */
export function AuthFormShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="w-full space-y-6">
      <Link href="/" className="inline-flex lg:hidden" aria-label="Image Service">
        <Logo />
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-surface sm:p-8">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>

      <p className="text-center text-sm text-muted">{footer}</p>
    </div>
  );
}
