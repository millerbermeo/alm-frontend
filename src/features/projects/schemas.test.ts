import { describe, expect, it } from "vitest";

import { projectFormSchema } from "./schemas";

const base = { name: "Shop", slug: "", description: "", status: "ACTIVE" as const };

describe("projectFormSchema", () => {
  it("accepts a minimal valid project", () => {
    expect(projectFormSchema.safeParse(base).success).toBe(true);
  });
  it("requires a name", () => {
    expect(projectFormSchema.safeParse({ ...base, name: "  " }).success).toBe(false);
  });
  it("accepts a blank slug (derived server-side)", () => {
    expect(projectFormSchema.safeParse({ ...base, slug: "" }).success).toBe(true);
  });
  it("rejects a malformed slug", () => {
    expect(projectFormSchema.safeParse({ ...base, slug: "Not A Slug" }).success).toBe(false);
    expect(projectFormSchema.safeParse({ ...base, slug: "ok-slug-2" }).success).toBe(true);
  });
  it("rejects an unknown status", () => {
    expect(projectFormSchema.safeParse({ ...base, status: "NOPE" }).success).toBe(false);
  });
});
