/**
 * Panel typography scale.
 *
 * One named step per role — hierarchy comes from weight and foreground color,
 * not from arbitrary sizes. Base body is 14px (`text-sm`). Import these instead
 * of hand-writing `text-… font-… text-foreground` triplets so every screen
 * reads the same.
 *
 * Only semantic color tokens (`foreground`, `muted`) — never a raw hex.
 */
export const typo = {
  /** Page-level `<h1>` in `PageHeader`. One per page. */
  pageTitle: "text-2xl font-semibold tracking-tight text-foreground",
  /** Section / card heading (`<h2>` / `<h3>`). */
  sectionTitle: "text-base font-semibold text-foreground",
  /** Field label, list-row primary text. */
  label: "text-sm font-medium text-foreground",
  /** Default body copy. */
  body: "text-sm text-foreground",
  /** Secondary body copy, descriptions, table cells that aren't the subject. */
  bodyMuted: "text-sm text-muted",
  /** Captions, metadata, helper text, table column headers. */
  caption: "text-xs text-muted",
} as const;

export type TypoRole = keyof typeof typo;
