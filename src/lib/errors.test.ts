import { describe, expect, it } from "vitest";

import { ApiError, apiErrorFromResponse, toMessage } from "./errors";

describe("apiErrorFromResponse", () => {
  it("uses the backend envelope code + message", () => {
    const err = apiErrorFromResponse(409, {
      code: "CONFLICT",
      message: "slug 'ecommerce' is already in use",
      data: null,
    });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.code).toBe("CONFLICT");
    expect(err.message).toBe("slug 'ecommerce' is already in use");
    expect(err.isConflict).toBe(true);
  });

  it("falls back to a friendly message for a non-envelope body", () => {
    const err = apiErrorFromResponse(401, "nope");
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.isUnauthorized).toBe(true);
    expect(err.message).toMatch(/sesión/i);
  });

  it("carries error_id when present", () => {
    const err = apiErrorFromResponse(500, {
      code: "INTERNAL_ERROR",
      message: "boom",
      data: null,
      error_id: "abc-123",
    });
    expect(err.errorId).toBe("abc-123");
    expect(err.isServer).toBe(true);
  });
});

describe("toMessage", () => {
  it("returns ApiError message verbatim", () => {
    expect(toMessage(new ApiError({ status: 400, code: "X", message: "bad" }))).toBe("bad");
  });
  it("handles unknown values", () => {
    expect(toMessage(null)).toMatch(/inesperado/i);
  });
});
