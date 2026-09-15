import { describe, expect, it } from "vitest";

import { buildSnippets, type SnippetConfig } from "./snippets";

const base: SnippetConfig = {
  baseUrl: "http://localhost:8080/",
  apiKey: "img_test_" + "a".repeat(40),
  imageId: "abc-123",
  folderId: "",
  folderPath: "",
  filePath: "./foto.png",
  visibility: "PUBLIC",
  limit: 20,
  search: "",
};

describe("buildSnippets", () => {
  it("emits one snippet per operation", () => {
    expect(buildSnippets(base).map((s) => s.id)).toEqual([
      "upload",
      "upload-dynamic-folder",
      "list",
      "get",
      "update",
      "delete",
    ]);
  });

  it("strips the trailing slash and injects /api/v1", () => {
    const list = buildSnippets(base).find((s) => s.id === "list")!;
    expect(list.curl).toContain('"http://localhost:8080/api/v1/images?limit=20"');
    expect(list.curl).not.toContain("8080//");
  });

  it("carries the bearer key into every snippet", () => {
    for (const s of buildSnippets(base)) {
      expect(s.curl).toContain(`Authorization: Bearer ${base.apiKey}`);
    }
  });

  it("falls back to placeholders when key / id are blank", () => {
    const s = buildSnippets({ ...base, apiKey: "", imageId: "" });
    const get = s.find((x) => x.id === "get")!;
    expect(get.curl).toContain("img_live_x");
    expect(get.curl).toContain("00000000-0000-0000-0000-000000000000");
  });

  it("adds folder_id to upload only when set", () => {
    expect(buildSnippets(base).find((s) => s.id === "upload")!.curl).not.toContain("folder_id");
    expect(
      buildSnippets({ ...base, folderId: "fld-9" }).find((s) => s.id === "upload")!.curl,
    ).toContain('-F "folder_id=fld-9"');
  });

  it("prefers folder_path over folder_id on upload when both are set", () => {
    const upload = buildSnippets({ ...base, folderId: "fld-9", folderPath: "users/id_123" }).find(
      (s) => s.id === "upload",
    )!;
    expect(upload.curl).toContain('-F "folder_path=users/id_123"');
    expect(upload.curl).not.toContain("folder_id");
  });

  it("defaults the dynamic-folder example to a placeholder path", () => {
    const dynamic = buildSnippets(base).find((s) => s.id === "upload-dynamic-folder")!;
    expect(dynamic.curl).toContain('-F "folder_path=users/id_123"');
  });

  it("sends folder_id: null in the update body when unset", () => {
    const update = buildSnippets(base).find((s) => s.id === "update")!;
    expect(update.curl).toContain('"folder_id":null');
  });

  it("omits the search param when blank and includes it when set", () => {
    expect(buildSnippets(base).find((s) => s.id === "list")!.curl).not.toContain("search=");
    expect(
      buildSnippets({ ...base, search: "logo" }).find((s) => s.id === "list")!.curl,
    ).toContain("search=logo");
  });
});
