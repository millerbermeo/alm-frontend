import { describe, expect, it } from "vitest";

import { decryptJsonWith, encryptJsonWith } from "./crypto-core";

const SECRET = "unit-test-secret-at-least-32-characters-long!!";

describe("crypto-core", () => {
  it("round-trips a JSON value", () => {
    const value = { "proj-1": "img_live_" + "a".repeat(40), n: 3 };
    const token = encryptJsonWith(SECRET, value);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decryptJsonWith(SECRET, token)).toEqual(value);
  });

  it("produces a different token each time (random iv/salt)", () => {
    const a = encryptJsonWith(SECRET, { x: 1 });
    const b = encryptJsonWith(SECRET, { x: 1 });
    expect(a).not.toBe(b);
  });

  it("fails closed on a wrong secret", () => {
    const token = encryptJsonWith(SECRET, { x: 1 });
    expect(decryptJsonWith("a-different-secret-value-thats-32-chars", token)).toBeNull();
  });

  it("fails closed on a tampered token", () => {
    const token = encryptJsonWith(SECRET, { x: 1 });
    const tampered = token.slice(0, -4) + "AAAA";
    expect(decryptJsonWith(SECRET, tampered)).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(decryptJsonWith(SECRET, "not-a-token")).toBeNull();
  });
});
