import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid credential pair", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
  it("rejects a malformed email", () => {
    const r = loginSchema.safeParse({ email: "nope", password: "x" });
    expect(r.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Jane",
    email: "jane@example.com",
    password: "abcdefgh12",
    confirmPassword: "abcdefgh12",
  };

  it("accepts a strong, matching password", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a password without a digit", () => {
    const r = registerSchema.safeParse({
      ...base,
      password: "abcdefghij",
      confirmPassword: "abcdefghij",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a short password", () => {
    const r = registerSchema.safeParse({ ...base, password: "ab1", confirmPassword: "ab1" });
    expect(r.success).toBe(false);
  });

  it("flags a mismatched confirmation on the confirmPassword field", () => {
    const r = registerSchema.safeParse({ ...base, confirmPassword: "different99" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    }
  });
});
