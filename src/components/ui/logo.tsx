import { cn } from "@/lib/utils/cn";

/** Wordmark + glyph. Pure SVG so it renders on the server with no flash. */
export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-6 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="9" cy="9" r="1.8" />
        <path d="m5 18 5.5-6 3.5 3.5L17 12l3 3.5" />
      </svg>
      {showWord ? <span>Image Service</span> : null}
    </span>
  );
}
