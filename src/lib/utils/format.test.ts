import { describe, expect, it } from "vitest";

import { formatBytes, formatDate } from "./format";

describe("formatBytes", () => {
  it("formats common magnitudes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 * 1024 * 3.5)).toBe("3.5 MB");
  });
});

describe("formatDate", () => {
  it("returns a dash for empty / invalid input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
  it("formats an ISO string", () => {
    expect(formatDate("2026-08-31T12:00:00Z")).not.toBe("—");
  });
});
