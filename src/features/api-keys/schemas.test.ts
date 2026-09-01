import { describe, expect, it } from "vitest";

import { createApiKeySchema } from "./schemas";

const base = {
  name: "Prod",
  permissions: ["images:read"] as const,
  test: false,
  expires_at: "",
};

describe("createApiKeySchema", () => {
  it("accepts a key with at least one permission and no expiry", () => {
    expect(createApiKeySchema.safeParse(base).success).toBe(true);
  });
  it("requires at least one permission", () => {
    expect(createApiKeySchema.safeParse({ ...base, permissions: [] }).success).toBe(false);
  });
  it("rejects an unknown permission", () => {
    expect(
      createApiKeySchema.safeParse({ ...base, permissions: ["images:destroy"] }).success,
    ).toBe(false);
  });
  it("rejects an expiry in the past", () => {
    expect(
      createApiKeySchema.safeParse({ ...base, expires_at: "2000-01-01T00:00" }).success,
    ).toBe(false);
  });
  it("accepts an expiry in the future", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);
    expect(createApiKeySchema.safeParse({ ...base, expires_at: future }).success).toBe(true);
  });
});
