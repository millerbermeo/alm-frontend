import { describe, expect, it } from "vitest";

import { imageMetaSchema, pasteKeySchema } from "./schemas";

describe("imageMetaSchema", () => {
  const base = {
    title: "",
    alt_text: "",
    description: "",
    visibility: "PRIVATE" as const,
    folder_id: "",
  };

  it("accepts empty optional fields", () => {
    expect(imageMetaSchema.safeParse(base).success).toBe(true);
  });
  it("rejects an over-long title", () => {
    expect(imageMetaSchema.safeParse({ ...base, title: "x".repeat(256) }).success).toBe(false);
  });
  it("rejects an unknown visibility", () => {
    expect(imageMetaSchema.safeParse({ ...base, visibility: "SECRET" }).success).toBe(false);
  });
});

describe("pasteKeySchema", () => {
  it("accepts a well-formed live key", () => {
    expect(
      pasteKeySchema.safeParse({ secret: "img_live_" + "a".repeat(40) }).success,
    ).toBe(true);
  });
  it("rejects a malformed key", () => {
    expect(pasteKeySchema.safeParse({ secret: "img_live_short" }).success).toBe(false);
    expect(pasteKeySchema.safeParse({ secret: "nope" }).success).toBe(false);
  });
});
